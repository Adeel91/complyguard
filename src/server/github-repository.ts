import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import AdmZip from "adm-zip";

const MAX_ARCHIVE_SIZE = 25 * 1024 * 1024;

/** 30-second fetch timeout for both GitHub API and archive download. */
const FETCH_TIMEOUT_MS = 30_000;

/**
 * A typed domain error that callers can inspect to choose the right HTTP
 * status code without leaking internal details to the client.
 */
export class GitHubRepositoryError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "rate_limited"
      | "not_found"
      | "too_large"
      | "invalid_url"
      | "download_failed"
      | "extract_failed",
  ) {
    super(message);
    this.name = "GitHubRepositoryError";
  }
}

export interface GitHubRepository {
  owner: string;
  repository: string;
  defaultBranch: string;
  rootPath: string;
  cleanup: () => Promise<void>;
}

function buildGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ComplyGuard",
  };

  const token = process.env.GITHUB_TOKEN;

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

function parseGitHubUrl(input: string) {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    throw new GitHubRepositoryError(
      "The repository URL is not valid.",
      "invalid_url",
    );
  }

  if (url.protocol !== "https:" || url.hostname !== "github.com") {
    throw new GitHubRepositoryError(
      "Only public HTTPS GitHub repository URLs are supported.",
      "invalid_url",
    );
  }

  const parts = url.pathname.replace(/^\/+|\/+$/g, "").split("/");

  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new GitHubRepositoryError(
      "Invalid GitHub repository URL. Expected https://github.com/owner/repository.",
      "invalid_url",
    );
  }

  return {
    owner: parts[0],
    repository: parts[1].replace(/\.git$/, ""),
  };
}

/**
 * Creates an AbortController that cancels after `ms` milliseconds.
 * Returns the controller so callers can also abort manually.
 */
function withTimeout(ms: number): { controller: AbortController; clear: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  return {
    controller,
    clear: () => clearTimeout(timer),
  };
}

/**
 * Asserts that `candidatePath` is inside `parentDirectory`.
 * Throws if a path traversal attempt is detected.
 */
function assertPathInside(candidatePath: string, parentDirectory: string): void {
  const resolved = resolve(candidatePath);
  const resolvedParent = resolve(parentDirectory);

  if (!resolved.startsWith(resolvedParent + "/") && resolved !== resolvedParent) {
    throw new GitHubRepositoryError(
      "Extracted path is outside the temporary directory.",
      "extract_failed",
    );
  }
}

export async function downloadGitHubRepository(
  repositoryUrl: string,
): Promise<GitHubRepository> {
  const { owner, repository } = parseGitHubUrl(repositoryUrl);

  // ── Metadata request ──────────────────────────────────────────────────────
  const metadataTimeout = withTimeout(FETCH_TIMEOUT_MS);
  let metadataResponse: Response;

  try {
    metadataResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repository}`,
      {
        headers: buildGitHubHeaders(),
        cache: "no-store",
        signal: metadataTimeout.controller.signal,
      },
    );
  } catch (error) {
    metadataTimeout.clear();

    if (error instanceof Error && error.name === "AbortError") {
      throw new GitHubRepositoryError(
        "GitHub API request timed out. Please try again.",
        "download_failed",
      );
    }

    throw new GitHubRepositoryError(
      "Could not reach the GitHub API.",
      "download_failed",
    );
  }

  metadataTimeout.clear();

  if (metadataResponse.status === 403 || metadataResponse.status === 429) {
    throw new GitHubRepositoryError(
      "GitHub API rate limit reached. Set the GITHUB_TOKEN environment variable to increase the limit, or try again later.",
      "rate_limited",
    );
  }

  if (!metadataResponse.ok) {
    throw new GitHubRepositoryError(
      "Repository was not found or is not publicly accessible.",
      "not_found",
    );
  }

  const metadata = (await metadataResponse.json()) as {
    default_branch?: string;
  };

  if (!metadata.default_branch) {
    throw new GitHubRepositoryError(
      "Unable to determine the default branch.",
      "download_failed",
    );
  }

  const defaultBranch = metadata.default_branch;

  // ── Archive download ───────────────────────────────────────────────────────
  const archiveTimeout = withTimeout(FETCH_TIMEOUT_MS);
  let archiveResponse: Response;

  try {
    archiveResponse = await fetch(
      `https://codeload.github.com/${owner}/${repository}/zip/refs/heads/${encodeURIComponent(
        defaultBranch,
      )}`,
      {
        headers: {
          "User-Agent": "ComplyGuard",
        },
        cache: "no-store",
        signal: archiveTimeout.controller.signal,
      },
    );
  } catch (error) {
    archiveTimeout.clear();

    if (error instanceof Error && error.name === "AbortError") {
      throw new GitHubRepositoryError(
        "GitHub archive download timed out. The repository may be too large.",
        "download_failed",
      );
    }

    throw new GitHubRepositoryError(
      "Could not download the repository archive.",
      "download_failed",
    );
  }

  archiveTimeout.clear();

  if (!archiveResponse.ok) {
    throw new GitHubRepositoryError(
      "GitHub archive download failed.",
      "download_failed",
    );
  }

  const contentLength = Number(
    archiveResponse.headers.get("content-length") ?? "0",
  );

  if (
    Number.isFinite(contentLength) &&
    contentLength > MAX_ARCHIVE_SIZE
  ) {
    throw new GitHubRepositoryError(
      "Repository archive exceeds the 25 MB hosted scanner limit. Use the local CLI to scan large repositories: pnpm scan ./path/to/project",
      "too_large",
    );
  }

  const archiveBuffer = Buffer.from(await archiveResponse.arrayBuffer());

  if (archiveBuffer.byteLength > MAX_ARCHIVE_SIZE) {
    throw new GitHubRepositoryError(
      "Repository archive exceeds the 25 MB hosted scanner limit. Use the local CLI to scan large repositories: pnpm scan ./path/to/project",
      "too_large",
    );
  }

  // ── Extraction ─────────────────────────────────────────────────────────────
  const temporaryRoot = await mkdtemp(join(tmpdir(), "complyguard-"));

  try {
    const zip = new AdmZip(archiveBuffer);

    for (const entry of zip.getEntries()) {
      const entryPath = join(temporaryRoot, entry.entryName);
      assertPathInside(entryPath, temporaryRoot);
    }

    zip.extractAllTo(temporaryRoot, true);

    const entries = await readdir(temporaryRoot, { withFileTypes: true });

    const extractedDirectory = entries.find((entry) => entry.isDirectory());

    if (!extractedDirectory) {
      throw new GitHubRepositoryError(
        "Repository archive was empty.",
        "extract_failed",
      );
    }

    const rootPath = join(temporaryRoot, extractedDirectory.name);

    // Guard against path traversal in the extracted top-level directory name.
    assertPathInside(rootPath, temporaryRoot);

    return {
      owner,
      repository,
      defaultBranch,
      rootPath,
      cleanup: () => rm(temporaryRoot, { recursive: true, force: true }),
    };
  } catch (error) {
    await rm(temporaryRoot, { recursive: true, force: true });
    throw error;
  }
}

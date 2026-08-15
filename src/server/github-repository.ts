import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import AdmZip from "adm-zip";

const MAX_ARCHIVE_SIZE = 25 * 1024 * 1024;

export interface GitHubRepository {
  owner: string;
  repository: string;
  defaultBranch: string;
  rootPath: string;
  cleanup: () => Promise<void>;
}

function parseGitHubUrl(input: string) {
  const url = new URL(input);

  if (url.protocol !== "https:" || url.hostname !== "github.com") {
    throw new Error("Only public HTTPS GitHub repository URLs are supported.");
  }

  const parts = url.pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/");

  if (parts.length < 2) {
    throw new Error("Invalid GitHub repository URL.");
  }

  return {
    owner: parts[0],
    repository: parts[1].replace(/\.git$/, ""),
  };
}

export async function downloadGitHubRepository(
  repositoryUrl: string,
): Promise<GitHubRepository> {
  const { owner, repository } = parseGitHubUrl(repositoryUrl);

  const metadataResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repository}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "ComplyGuard",
      },
      cache: "no-store",
    },
  );

  if (!metadataResponse.ok) {
    throw new Error(
      "Repository was not found or is not publicly accessible.",
    );
  }

  const metadata = (await metadataResponse.json()) as {
    default_branch?: string;
  };

  if (!metadata.default_branch) {
    throw new Error("Unable to determine the default branch.");
  }

  const defaultBranch = metadata.default_branch;

  const archiveResponse = await fetch(
    `https://codeload.github.com/${owner}/${repository}/zip/refs/heads/${encodeURIComponent(
      defaultBranch,
    )}`,
    {
      headers: {
        "User-Agent": "ComplyGuard",
      },
      cache: "no-store",
    },
  );

  if (!archiveResponse.ok) {
    throw new Error("GitHub archive download failed.");
  }

  const archiveBuffer = Buffer.from(
    await archiveResponse.arrayBuffer(),
  );

  if (archiveBuffer.byteLength > MAX_ARCHIVE_SIZE) {
    throw new Error("Repository archive exceeds the hosted scanner size limit.");
  }

  const temporaryRoot = await mkdtemp(
    join(tmpdir(), "complyguard-"),
  );

  try {
    const zip = new AdmZip(archiveBuffer);

    zip.extractAllTo(temporaryRoot, true);

    const entries = await readdir(temporaryRoot, {
      withFileTypes: true,
    });

    const extractedDirectory = entries.find((entry) =>
      entry.isDirectory(),
    );

    if (!extractedDirectory) {
      throw new Error("Repository archive was empty.");
    }

    return {
      owner,
      repository,
      defaultBranch,
      rootPath: join(
        temporaryRoot,
        extractedDirectory.name,
      ),
      cleanup: () =>
        rm(temporaryRoot, {
          recursive: true,
          force: true,
        }),
    };
  } catch (error) {
    await rm(temporaryRoot, {
      recursive: true,
      force: true,
    });

    throw error;
  }
}

import { timingSafeEqual } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";

export function resolveKiroExecutable(
  projectRoot = process.cwd(),
  configuredPath = process.env.KIRO_CLI_PATH,
): string {
  const explicitPath = configuredPath?.trim();

  if (explicitPath) {
    return explicitPath;
  }

  const bundledPath = resolve(
    projectRoot,
    ".kiro-runtime",
    "kiro-cli",
  );

  if (existsSync(bundledPath)) {
    return bundledPath;
  }

  return "kiro-cli";
}

export function isDeepReviewAuthorized(
  providedToken: string | null | undefined,
  expectedToken = process.env.COMPLYGUARD_DEEP_REVIEW_TOKEN,
): boolean {
  if (!providedToken || !expectedToken) {
    return false;
  }

  const provided = Buffer.from(providedToken, "utf8");
  const expected = Buffer.from(expectedToken, "utf8");

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
}

export function sanitizeRepositoryPaths<T>(
  value: T,
  repositoryRoot: string,
): T {
  const absoluteRoot = resolve(repositoryRoot);

  function sanitize(input: unknown): unknown {
    if (typeof input === "string") {
      return input
        .replaceAll(`${absoluteRoot}${sep}`, "")
        .replaceAll(`${absoluteRoot}/`, "")
        .replaceAll(`${absoluteRoot}\\`, "");
    }

    if (Array.isArray(input)) {
      return input.map(sanitize);
    }

    if (input && typeof input === "object") {
      return Object.fromEntries(
        Object.entries(input).map(([key, child]) => [
          key,
          sanitize(child),
        ]),
      );
    }

    return input;
  }

  return sanitize(value) as T;
}

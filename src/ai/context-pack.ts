import {
  readFileSync,
} from "node:fs";

import {
  relative,
  resolve,
  sep,
} from "node:path";

import type {
  DeepReviewSourceContext,
} from "@/ai/types";

import type {
  RootRisk,
} from "@/scanner/correlation/types";

const DEFAULT_CONTEXT_RADIUS =
  12;

const DEFAULT_MAX_RISKS =
  20;

function ensureInsideProject(
  projectRoot: string,
  candidate: string,
): string {
  const resolvedRoot =
    resolve(
      projectRoot,
    );

  const resolvedFile =
    resolve(
      resolvedRoot,
      candidate,
    );

  const relativePath =
    relative(
      resolvedRoot,
      resolvedFile,
    );

  if (
    relativePath ===
      ".." ||
    relativePath.startsWith(
      `..${sep}`,
    ) ||
    relativePath ===
      ""
  ) {
    if (
      resolvedFile !==
      resolvedRoot
    ) {
      throw new Error(
        `Refusing to read source outside project root: ${candidate}`,
      );
    }
  }

  return resolvedFile;
}

function normalizeLine(
  line: number,
): number {
  if (
    !Number.isFinite(
      line,
    )
  ) {
    return 1;
  }

  return Math.max(
    1,
    Math.floor(
      line,
    ),
  );
}

export type ContextPackOptions = {
  radius?: number;
  maxRisks?: number;
};

export function buildDeepReviewContexts(
  projectRoot: string,
  rootRisks: RootRisk[],
  options: ContextPackOptions = {},
): DeepReviewSourceContext[] {
  const radius =
    Math.max(
      1,
      options.radius ??
        DEFAULT_CONTEXT_RADIUS,
    );

  const maxRisks =
    Math.max(
      1,
      options.maxRisks ??
        DEFAULT_MAX_RISKS,
    );

  const contexts:
    DeepReviewSourceContext[] =
      [];

  const limitedRisks =
    rootRisks.slice(
      0,
      maxRisks,
    );

  for (
    const risk of
    limitedRisks
  ) {
    const file =
      risk.evidence.file;

    const absoluteFile =
      ensureInsideProject(
        projectRoot,
        file,
      );

    let raw: string;

    try {
      raw =
        readFileSync(
          absoluteFile,
          "utf8",
        );
    } catch {
      continue;
    }

    const lines =
      raw.split(
        /\r?\n/,
      );

    const findingLine =
      normalizeLine(
        risk.evidence.line,
      );

    const startLine =
      Math.max(
        1,
        findingLine -
          radius,
      );

    const endLine =
      Math.min(
        lines.length,
        findingLine +
          radius,
      );

    const content =
      lines
        .slice(
          startLine - 1,
          endLine,
        )
        .map(
          (
            line,
            index,
          ) =>
            `${String(startLine + index).padStart(4, " ")} | ${line}`,
        )
        .join(
          "\n",
        );

    contexts.push({
      rootRiskId:
        risk.id,

      file,

      startLine,

      endLine,

      content,
    });
  }

  return contexts;
}

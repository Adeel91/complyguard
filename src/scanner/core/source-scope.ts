import {
  existsSync,
  readFileSync,
} from "node:fs";

import {
  relative,
  resolve,
  sep,
} from "node:path";

import type {
  Project,
} from "ts-morph";

const DEFAULT_IGNORED_DIRECTORIES =
  new Set([
    ".git",
    ".next",
    "node_modules",
    "dist",
    "build",
    "coverage",
  ]);

function normalizePath(
  value: string,
): string {
  return value
    .split(sep)
    .join("/")
    .replace(
      /^\.\//,
      "",
    );
}

function escapeRegexCharacter(
  value: string,
): string {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&",
  );
}

function ignorePatternToRegex(
  rawPattern: string,
): RegExp {
  let pattern =
    normalizePath(
      rawPattern.trim(),
    );

  const explicitlyAnchored =
    pattern.startsWith(
      "/",
    );

  pattern =
    pattern.replace(
      /^\/+/,
      "",
    );

  const directoryPattern =
    pattern.endsWith(
      "/",
    );

  if (
    directoryPattern
  ) {
    pattern =
      pattern.slice(
        0,
        -1,
      );
  }

  const containsPathSeparator =
    pattern.includes(
      "/",
    );

  let expression = "";

  for (
    let index = 0;
    index <
    pattern.length;
    index += 1
  ) {
    const character =
      pattern[index];

    if (
      character === "*"
    ) {
      const nextCharacter =
        pattern[
          index + 1
        ];

      if (
        nextCharacter ===
        "*"
      ) {
        expression +=
          ".*";

        index += 1;

        continue;
      }

      expression +=
        "[^/]*";

      continue;
    }

    if (
      character === "?"
    ) {
      expression +=
        "[^/]";

      continue;
    }

    expression +=
      escapeRegexCharacter(
        character,
      );
  }

  const prefix =
    explicitlyAnchored ||
    containsPathSeparator
      ? "^"
      : "^(?:.*/)?";

  const suffix =
    directoryPattern
      ? "(?:/.*)?$"
      : "$";

  return new RegExp(
    `${prefix}${expression}${suffix}`,
  );
}

export function readComplyGuardIgnore(
  projectRoot: string,
): string[] {
  const ignorePath =
    resolve(
      projectRoot,
      ".complyguardignore",
    );

  if (
    !existsSync(
      ignorePath,
    )
  ) {
    return [];
  }

  return readFileSync(
    ignorePath,
    "utf8",
  )
    .split(
      /\r?\n/,
    )
    .map(
      (
        line,
      ) =>
        line.trim(),
    )
    .filter(
      (
        line,
      ) =>
        line !== "" &&
        !line.startsWith(
          "#",
        ),
    );
}

function isDefaultIgnored(
  relativePath: string,
): boolean {
  return relativePath
    .split(
      "/",
    )
    .some(
      (
        segment,
      ) =>
        DEFAULT_IGNORED_DIRECTORIES.has(
          segment,
        ),
    );
}

function matchesCustomIgnore(
  relativePath: string,
  patterns: string[],
): boolean {
  let ignored =
    false;

  for (
    const rawPattern of
      patterns
  ) {
    const negated =
      rawPattern.startsWith(
        "!",
      );

    const pattern =
      negated
        ? rawPattern.slice(
            1,
          )
        : rawPattern;

    if (
      pattern === ""
    ) {
      continue;
    }

    const regex =
      ignorePatternToRegex(
        pattern,
      );

    if (
      regex.test(
        relativePath,
      )
    ) {
      ignored =
        !negated;
    }
  }

  return ignored;
}

export function isSourceFileIgnored(
  projectRoot: string,
  sourceFilePath: string,
  patterns =
    readComplyGuardIgnore(
      projectRoot,
    ),
): boolean {
  const rootPath =
    resolve(
      projectRoot,
    );

  const filePath =
    resolve(
      sourceFilePath,
    );

  const relativePath =
    normalizePath(
      relative(
        rootPath,
        filePath,
      ),
    );

  if (
    relativePath === ".." ||
    relativePath.startsWith(
      "../",
    )
  ) {
    return true;
  }

  if (
    isDefaultIgnored(
      relativePath,
    )
  ) {
    return true;
  }

  return matchesCustomIgnore(
    relativePath,
    patterns,
  );
}

export function applySourceScope(
  project: Project,
  projectRoot: string,
): number {
  const patterns =
    readComplyGuardIgnore(
      projectRoot,
    );

  const ignoredSourceFiles =
    project
      .getSourceFiles()
      .filter(
        (
          sourceFile,
        ) =>
          isSourceFileIgnored(
            projectRoot,
            sourceFile.getFilePath(),
            patterns,
          ),
      );

  for (
    const sourceFile of
      ignoredSourceFiles
  ) {
    project.removeSourceFile(
      sourceFile,
    );
  }

  return ignoredSourceFiles.length;
}

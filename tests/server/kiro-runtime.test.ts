import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  isDeepReviewAuthorized,
  resolveKiroExecutable,
  sanitizeRepositoryPaths,
} from "@/server/kiro-runtime";

const temporaryDirectories: string[] = [];

function temporaryDirectory() {
  const directory = mkdtempSync(
    join(
      tmpdir(),
      "complyguard-kiro-runtime-",
    ),
  );

  temporaryDirectories.push(directory);

  return directory;
}

afterEach(() => {
  for (
    const directory of temporaryDirectories.splice(0)
  ) {
    rmSync(
      directory,
      {
        recursive: true,
        force: true,
      },
    );
  }
});

describe("Kiro hosted runtime", () => {
  it("prefers an explicitly configured executable", () => {
    expect(
      resolveKiroExecutable(
        "/project",
        "/custom/kiro-cli",
      ),
    ).toBe("/custom/kiro-cli");
  });

  it("uses a bundled Vercel executable when present", () => {
    const root = temporaryDirectory();

    mkdirSync(
      join(root, ".kiro-runtime"),
      {
        recursive: true,
      },
    );

    const executable = join(
      root,
      ".kiro-runtime",
      "kiro-cli",
    );

    writeFileSync(
      executable,
      "test",
    );

    expect(
      resolveKiroExecutable(
        root,
        "",
      ),
    ).toBe(executable);
  });

  it("validates Deep Review access codes safely", () => {
    expect(
      isDeepReviewAuthorized(
        "judge-code",
        "judge-code",
      ),
    ).toBe(true);

    expect(
      isDeepReviewAuthorized(
        "wrong-code",
        "judge-code",
      ),
    ).toBe(false);

    expect(
      isDeepReviewAuthorized(
        "",
        "judge-code",
      ),
    ).toBe(false);
  });

  it("removes server repository roots from responses", () => {
    const root =
      "/tmp/complyguard/repository";

    const sanitized =
      sanitizeRepositoryPaths(
        {
          evidence: {
            file:
              "/tmp/complyguard/repository/src/auth.ts",
          },
          nested: [
            "/tmp/complyguard/repository/src/user.ts",
          ],
        },
        root,
      );

    expect(
      sanitized,
    ).toEqual({
      evidence: {
        file: "src/auth.ts",
      },
      nested: [
        "src/user.ts",
      ],
    });
  });
});

import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";

import {
  tmpdir,
} from "node:os";

import {
  join,
  relative,
} from "node:path";

import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  loadProject,
} from "@/scanner/core/project-loader";

import {
  isSourceFileIgnored,
  readComplyGuardIgnore,
} from "@/scanner/core/source-scope";

const temporaryDirectories:
  string[] = [];

function createTemporaryProject(): string {
  const root =
    mkdtempSync(
      join(
        tmpdir(),
        "complyguard-scope-",
      ),
    );

  temporaryDirectories.push(
    root,
  );

  return root;
}

function writeSource(
  root: string,
  path: string,
  content =
    "export const value = true;",
): void {
  const fullPath =
    join(
      root,
      path,
    );

  const directory =
    fullPath.slice(
      0,
      Math.max(
        fullPath.lastIndexOf(
          "/",
        ),
        0,
      ),
    );

  if (
    directory !== ""
  ) {
    mkdirSync(
      directory,
      {
        recursive: true,
      },
    );
  }

  writeFileSync(
    fullPath,
    content,
  );
}

afterEach(
  () => {
    for (
      const directory of
        temporaryDirectories.splice(
          0,
        )
    ) {
      rmSync(
        directory,
        {
          recursive: true,
          force: true,
        },
      );
    }
  },
);

describe(
  "source scope",
  () => {
    it(
      "ignores generated and dependency directories by default",
      () => {
        const root =
          createTemporaryProject();

        expect(
          isSourceFileIgnored(
            root,
            join(
              root,
              "node_modules/pkg/index.ts",
            ),
          ),
        ).toBe(
          true,
        );

        expect(
          isSourceFileIgnored(
            root,
            join(
              root,
              ".next/server/app.ts",
            ),
          ),
        ).toBe(
          true,
        );

        expect(
          isSourceFileIgnored(
            root,
            join(
              root,
              "coverage/generated.ts",
            ),
          ),
        ).toBe(
          true,
        );

        expect(
          isSourceFileIgnored(
            root,
            join(
              root,
              "src/app.ts",
            ),
          ),
        ).toBe(
          false,
        );
      },
    );

    it(
      "loads repository specific ignore patterns",
      () => {
        const root =
          createTemporaryProject();

        writeFileSync(
          join(
            root,
            ".complyguardignore",
          ),
          [
            "# intentional source",
            "tests/",
            "demo/vulnerable-app/",
          ].join(
            "\n",
          ),
        );

        expect(
          readComplyGuardIgnore(
            root,
          ),
        ).toEqual([
          "tests/",
          "demo/vulnerable-app/",
        ]);

        expect(
          isSourceFileIgnored(
            root,
            join(
              root,
              "tests/example.ts",
            ),
          ),
        ).toBe(
          true,
        );

        expect(
          isSourceFileIgnored(
            root,
            join(
              root,
              "demo/vulnerable-app/auth.ts",
            ),
          ),
        ).toBe(
          true,
        );

        expect(
          isSourceFileIgnored(
            root,
            join(
              root,
              "src/auth.ts",
            ),
          ),
        ).toBe(
          false,
        );
      },
    );

    it(
      "applies ignore rules to a tsconfig based project",
      () => {
        const root =
          createTemporaryProject();

        writeFileSync(
          join(
            root,
            "tsconfig.json",
          ),
          JSON.stringify(
            {
              compilerOptions: {
                allowJs:
                  true,
              },
              include: [
                "**/*.ts",
              ],
            },
            null,
            2,
          ),
        );

        writeFileSync(
          join(
            root,
            ".complyguardignore",
          ),
          [
            "tests/",
            "demo/vulnerable-app/",
          ].join(
            "\n",
          ),
        );

        writeSource(
          root,
          "src/app.ts",
        );

        writeSource(
          root,
          "tests/vulnerable.ts",
        );

        writeSource(
          root,
          "demo/vulnerable-app/auth.ts",
        );

        const loaded =
          loadProject(
            root,
          );

        const files =
          loaded.project
            .getSourceFiles()
            .map(
              (
                sourceFile,
              ) =>
                relative(
                  root,
                  sourceFile.getFilePath(),
                ).replaceAll(
                  "\\",
                  "/",
                ),
            );

        expect(
          files,
        ).toContain(
          "src/app.ts",
        );

        expect(
          files,
        ).not.toContain(
          "tests/vulnerable.ts",
        );

        expect(
          files,
        ).not.toContain(
          "demo/vulnerable-app/auth.ts",
        );
      },
    );

    it(
      "does not inherit an ignore file from a parent scan root",
      () => {
        const repositoryRoot =
          createTemporaryProject();

        const demoRoot =
          join(
            repositoryRoot,
            "demo/vulnerable-app",
          );

        mkdirSync(
          demoRoot,
          {
            recursive: true,
          },
        );

        writeFileSync(
          join(
            repositoryRoot,
            ".complyguardignore",
          ),
          "demo/vulnerable-app/\n",
        );

        writeSource(
          demoRoot,
          "auth.ts",
          "export const password = 'demo';",
        );

        const loaded =
          loadProject(
            demoRoot,
          );

        const files =
          loaded.project
            .getSourceFiles()
            .map(
              (
                sourceFile,
              ) =>
                relative(
                  demoRoot,
                  sourceFile.getFilePath(),
                ).replaceAll(
                  "\\",
                  "/",
                ),
            );

        expect(
          files,
        ).toContain(
          "auth.ts",
        );
      },
    );
  },
);

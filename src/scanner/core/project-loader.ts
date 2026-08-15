import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { Project } from "ts-morph";

export interface LoadedProject {
  rootPath: string;
  project: Project;
}

export function loadProject(projectPath: string): LoadedProject {
  const rootPath = resolve(projectPath);
  const tsconfigPath = resolve(rootPath, "tsconfig.json");

  if (!existsSync(rootPath)) {
    throw new Error(`Project path does not exist: ${rootPath}`);
  }

  const project = existsSync(tsconfigPath)
    ? new Project({
        tsConfigFilePath: tsconfigPath,
        skipAddingFilesFromTsConfig: false,
      })
    : new Project({
        compilerOptions: {
          allowJs: true,
          checkJs: false,
        },
      });

  if (!existsSync(tsconfigPath)) {
    project.addSourceFilesAtPaths([
      `${rootPath}/**/*.{ts,tsx,js,jsx}`,
      `!${rootPath}/node_modules/**/*`,
      `!${rootPath}/.next/**/*`,
      `!${rootPath}/dist/**/*`,
      `!${rootPath}/build/**/*`,
    ]);
  }

  return {
    rootPath,
    project,
  };
}

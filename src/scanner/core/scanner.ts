import type { ComplianceFinding } from "@/scanner/types/finding";
import type { ComplianceRule } from "@/scanner/types/rule";

import { loadProject } from "@/scanner/core/project-loader";

export interface ScanResult {
  projectPath: string;
  sourceFileCount: number;
  ruleCount: number;
  findings: ComplianceFinding[];
}

export function scanProject(
  projectPath: string,
  rules: ComplianceRule[],
): ScanResult {
  const loaded = loadProject(projectPath);

  const sourceFiles = loaded.project
    .getSourceFiles()
    .filter((sourceFile) => !sourceFile.isDeclarationFile());

  const findings = sourceFiles.flatMap((sourceFile) =>
    rules.flatMap((rule) => rule.analyze(sourceFile)),
  );

  return {
    projectPath: loaded.rootPath,
    sourceFileCount: sourceFiles.length,
    ruleCount: rules.length,
    findings,
  };
}

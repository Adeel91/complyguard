import { SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";

export const isoDynamicCodeRule: ComplianceRule = {
  id: "ISO27001-CODE-001",
  framework: "iso27001",
  control: "ISO 27001:2022 A.8.28",
  title: "Dynamic code execution",

  analyze(sourceFile) {
    const findings = [];

    for (const call of sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression,
    )) {
      if (call.getExpression().getText() !== "eval") {
        continue;
      }

      findings.push(
        createFinding({
          node: call,
          ruleId: "ISO27001-CODE-001",
          framework: "iso27001",
          control: "ISO 27001:2022 A.8.28",
          severity: "high",
          title: "Dynamic code execution",
          description:
            "eval introduces a path for dynamically constructed code to execute.",
          remediation:
            "Replace dynamic execution with explicit application logic and validated data processing.",
        }),
      );
    }

    return findings;
  },
};

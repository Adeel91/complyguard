import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import {
  containsPersonalName,
  containsSensitiveName,
} from "@/scanner/utils/names";

export const isoSensitiveLoggingRule: ComplianceRule = {
  id: "ISO27001-LOG-001",
  framework: "iso27001",
  control: "ISO 27001:2022 A.8.15",
  title: "Sensitive information written to logs",

  analyze(sourceFile) {
    const findings = [];

    for (const call of sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression,
    )) {
      const expression = call.getExpression();

      if (
        !Node.isPropertyAccessExpression(expression) ||
        expression.getExpression().getText() !== "console"
      ) {
        continue;
      }

      const risky = call.getArguments().some((argument) => {
        const value = argument.getText();

        return (
          containsSensitiveName(value) ||
          containsPersonalName(value)
        );
      });

      if (!risky) {
        continue;
      }

      findings.push(
        createFinding({
          node: call,
          ruleId: "ISO27001-LOG-001",
          framework: "iso27001",
          control: "ISO 27001:2022 A.8.15",
          severity: "high",
          title: "Sensitive information written to logs",
          description:
            "Application logging appears to include sensitive or personal information.",
          remediation:
            "Redact sensitive values and log only the minimum operational information required.",
        }),
      );
    }

    return findings;
  },
};

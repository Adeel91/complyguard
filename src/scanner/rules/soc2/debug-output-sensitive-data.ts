import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import {
  containsPersonalName,
  containsSensitiveName,
} from "@/scanner/utils/names";

export const soc2DebugOutputSensitiveDataRule: ComplianceRule = {
  id: "SOC2-LOG-001",
  framework: "soc2",
  control: "SOC 2 CC7.2",
  title: "Sensitive data exposed through debug output",

  analyze(sourceFile) {
    const findings = [];

    for (const call of sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression,
    )) {
      const expression = call.getExpression();

      if (!Node.isPropertyAccessExpression(expression)) {
        continue;
      }

      if (expression.getExpression().getText() !== "console") {
        continue;
      }

      const method = expression.getName();

      if (!["log", "debug", "info", "warn", "error"].includes(method)) {
        continue;
      }

      const risky = call.getArguments().some((argument) => {
        const text = argument.getText();

        return containsSensitiveName(text) || containsPersonalName(text);
      });

      if (!risky) {
        continue;
      }

      findings.push(
        createFinding({
          node: call,
          ruleId: "SOC2-LOG-001",
          framework: "soc2",
          control: "SOC 2 CC7.2",
          severity: "high",
          title: "Sensitive data exposed through debug output",
          description:
            "Sensitive or personal information appears to be written to application logs.",
          remediation:
            "Remove sensitive values from logs or replace them with redacted or non sensitive identifiers.",
        }),
      );
    }

    return findings;
  },
};

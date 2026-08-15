import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import {
  containsPersonalName,
  containsSensitiveName,
} from "@/scanner/utils/names";

export const sensitiveConsoleLogRule: ComplianceRule = {
  id: "GDPR-LOG-001",
  framework: "gdpr",
  control: "GDPR Article 5(1)(c), Article 32",
  title: "Sensitive data written to console",

  analyze(sourceFile) {
    const findings = [];

    for (const call of sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression,
    )) {
      const expression = call.getExpression();

      if (!Node.isPropertyAccessExpression(expression)) {
        continue;
      }

      const target = expression.getExpression().getText();
      const method = expression.getName();

      if (
        target !== "console" ||
        !["log", "info", "warn", "error", "debug"].includes(method)
      ) {
        continue;
      }

      const riskyArguments = call.getArguments().filter((argument) => {
        const text = argument.getText();

        return containsSensitiveName(text) || containsPersonalName(text);
      });

      if (riskyArguments.length === 0) {
        continue;
      }

      findings.push(
        createFinding({
          node: call,
          ruleId: "GDPR-LOG-001",
          framework: "gdpr",
          control: "GDPR Article 5(1)(c), Article 32",
          severity: "high",
          title: "Sensitive data written to console",
          description:
            "A console statement appears to include personal or sensitive data. Application logs may persist beyond the original processing purpose and may be accessible to additional operators or systems.",
          remediation:
            "Remove the sensitive value from the log, redact it, or log only a non sensitive identifier required for operational diagnostics.",
        }),
      );
    }

    return findings;
  },
};

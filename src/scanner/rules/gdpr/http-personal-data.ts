import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import {
  containsPersonalName,
  containsSensitiveName,
} from "@/scanner/utils/names";

function isHttpUrl(value: string): boolean {
  return /^http:\/\//i.test(value);
}

export const httpPersonalDataRule: ComplianceRule = {
  id: "GDPR-TRANS-001",
  framework: "gdpr",
  control: "GDPR Article 32",
  title: "Potential personal data sent over insecure HTTP",

  analyze(sourceFile) {
    const findings = [];

    for (const call of sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression,
    )) {
      const expressionText = call.getExpression().getText();

      if (!["fetch", "axios", "axios.post", "axios.put"].includes(expressionText)) {
        continue;
      }

      const args = call.getArguments();

      if (args.length === 0) {
        continue;
      }

      const urlArg = args[0];

      if (!Node.isStringLiteral(urlArg)) {
        continue;
      }

      if (!isHttpUrl(urlArg.getLiteralValue())) {
        continue;
      }

      const fullText = call.getText();

      if (
        !containsPersonalName(fullText) &&
        !containsSensitiveName(fullText)
      ) {
        continue;
      }

      findings.push(
        createFinding({
          node: call,
          ruleId: "GDPR-TRANS-001",
          framework: "gdpr",
          control: "GDPR Article 32",
          severity: "critical",
          title: "Potential personal data sent over insecure HTTP",
          description:
            "A request to an unencrypted HTTP endpoint appears to include personal or sensitive data.",
          remediation:
            "Use HTTPS and verify that the remote service has appropriate transport security and data processing controls.",
        }),
      );
    }

    return findings;
  },
};

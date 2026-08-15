import { SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import { containsSensitiveName } from "@/scanner/utils/names";

export const insecurePasswordComparisonRule: ComplianceRule = {
  id: "GDPR-AUTH-001",
  framework: "gdpr",
  control: "GDPR Article 32",
  title: "Direct sensitive credential comparison",

  analyze(sourceFile) {
    const findings = [];

    for (const binary of sourceFile.getDescendantsOfKind(
      SyntaxKind.BinaryExpression,
    )) {
      const operator = binary.getOperatorToken().getKind();

      if (
        operator !== SyntaxKind.EqualsEqualsEqualsToken &&
        operator !== SyntaxKind.EqualsEqualsToken
      ) {
        continue;
      }

      const left = binary.getLeft().getText();
      const right = binary.getRight().getText();

      if (
        !containsSensitiveName(left) &&
        !containsSensitiveName(right)
      ) {
        continue;
      }

      findings.push(
        createFinding({
          node: binary,
          ruleId: "GDPR-AUTH-001",
          framework: "gdpr",
          control: "GDPR Article 32",
          severity: "high",
          title: "Direct sensitive credential comparison",
          description:
            "Sensitive credentials appear to be compared directly. Passwords should normally be verified using a dedicated password hashing function rather than plaintext comparison.",
          remediation:
            "Store passwords using a suitable password hashing algorithm and verify them with the corresponding secure comparison function.",
        }),
      );
    }

    return findings;
  },
};

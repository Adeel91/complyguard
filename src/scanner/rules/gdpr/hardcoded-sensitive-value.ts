import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import { containsSensitiveName } from "@/scanner/utils/names";

const SUSPICIOUS_VALUE_PATTERNS = [
  /^sk_[a-zA-Z0-9]+$/,
  /^pk_[a-zA-Z0-9]+$/,
  /^Bearer\s+/i,
  /^[A-Za-z0-9+/]{24,}={0,2}$/,
];

function looksLikeSecret(value: string): boolean {
  if (value.length < 12) {
    return false;
  }

  return SUSPICIOUS_VALUE_PATTERNS.some((pattern) => pattern.test(value));
}

export const hardcodedSensitiveValueRule: ComplianceRule = {
  id: "GDPR-SEC-001",
  framework: "gdpr",
  control: "GDPR Article 32",
  title: "Hardcoded sensitive credential",

  analyze(sourceFile) {
    const findings = [];

    for (const declaration of sourceFile.getDescendantsOfKind(
      SyntaxKind.VariableDeclaration,
    )) {
      const name = declaration.getName();

      if (!containsSensitiveName(name)) {
        continue;
      }

      const initializer = declaration.getInitializer();

      if (
        !initializer ||
        (!Node.isStringLiteral(initializer) &&
          !Node.isNoSubstitutionTemplateLiteral(initializer))
      ) {
        continue;
      }

      const value = initializer.getLiteralValue();

      if (!looksLikeSecret(value)) {
        continue;
      }

      findings.push(
        createFinding({
          node: declaration,
          ruleId: "GDPR-SEC-001",
          framework: "gdpr",
          control: "GDPR Article 32",
          severity: "critical",
          title: "Hardcoded sensitive credential",
          description:
            "A credential or secret appears to be embedded directly in source code. Exposed credentials may allow unauthorized access to systems processing personal data.",
          remediation:
            "Move the credential to a protected secret store or environment variable and rotate any credential that may already have been committed.",
        }),
      );
    }

    return findings;
  },
};

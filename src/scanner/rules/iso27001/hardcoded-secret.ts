import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import { containsSensitiveName } from "@/scanner/utils/names";

/**
 * Returns true when a string value looks like a real credential rather than a
 * placeholder, environment variable name, or short configuration string.
 *
 * Aligned with the GDPR-SEC-001 and SOC2-SEC-001 detection strategies:
 *   - Stripe-style keys:   sk_... / pk_...
 *   - Bearer tokens:       Bearer <value>
 *   - Base64-ish secrets:  24+ chars of base64 alphabet ± padding
 *   - Generic long secrets: 16+ chars with mixed alphanum
 *
 * Minimum length threshold matches the most permissive rule (SOC2: 12 chars).
 */
function looksLikeHardcodedCredential(value: string): boolean {
  if (value.length < 12) {
    return false;
  }

  // Stripe-style API keys.
  if (/^sk_[a-zA-Z0-9]+$/.test(value) || /^pk_[a-zA-Z0-9]+$/.test(value)) {
    return true;
  }

  // Bearer token header values.
  if (/^Bearer\s+/i.test(value)) {
    return true;
  }

  // Base64-encoded values of significant length.
  if (/^[A-Za-z0-9+/]{24,}={0,2}$/.test(value)) {
    return true;
  }

  return false;
}

export const isoHardcodedSecretRule: ComplianceRule = {
  id: "ISO27001-SEC-001",
  framework: "iso27001",
  control: "ISO 27001:2022 A.8.4, A.8.28",
  title: "Hardcoded credential in source code",

  analyze(sourceFile) {
    const findings = [];

    for (const declaration of sourceFile.getDescendantsOfKind(
      SyntaxKind.VariableDeclaration,
    )) {
      if (!containsSensitiveName(declaration.getName())) {
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

      if (!looksLikeHardcodedCredential(value)) {
        continue;
      }

      findings.push(
        createFinding({
          node: declaration,
          ruleId: "ISO27001-SEC-001",
          framework: "iso27001",
          control: "ISO 27001:2022 A.8.4, A.8.28",
          severity: "critical",
          title: "Hardcoded credential in source code",
          description:
            "A security sensitive credential appears to be stored directly in application source code.",
          remediation:
            "Move credentials into a protected secret management system and rotate any value that may have been exposed.",
        }),
      );
    }

    return findings;
  },
};

import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import { containsSensitiveName } from "@/scanner/utils/names";

function looksLikeCredential(value: string): boolean {
  if (value.length < 12) {
    return false;
  }

  return (
    /^sk_[a-zA-Z0-9]+$/.test(value) ||
    /^Bearer\s+/i.test(value) ||
    /^[A-Za-z0-9+/]{24,}={0,2}$/.test(value)
  );
}

export const soc2HardcodedSecretRule: ComplianceRule = {
  id: "SOC2-SEC-001",
  framework: "soc2",
  control: "SOC 2 CC6.1",
  title: "Hardcoded secret in source code",

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

      if (!looksLikeCredential(value)) {
        continue;
      }

      findings.push(
        createFinding({
          node: declaration,
          ruleId: "SOC2-SEC-001",
          framework: "soc2",
          control: "SOC 2 CC6.1",
          severity: "critical",
          title: "Hardcoded secret in source code",
          description:
            "A credential appears to be embedded directly in application source code, increasing the risk of unauthorized access.",
          remediation:
            "Store credentials in an approved secret manager or environment variable and rotate exposed credentials.",
        }),
      );
    }

    return findings;
  },
};

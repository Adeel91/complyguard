import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import { containsSensitiveName } from "@/scanner/utils/names";

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

      if (value.length < 16) {
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

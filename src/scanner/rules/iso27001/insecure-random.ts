import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import { containsSensitiveName } from "@/scanner/utils/names";

export const isoInsecureRandomRule: ComplianceRule = {
  id: "ISO27001-RANDOM-001",
  framework: "iso27001",
  control: "ISO 27001:2022 A.8.24, A.8.28",
  title: "Weak randomness used for security value",

  analyze(sourceFile) {
    const findings = [];

    for (const declaration of sourceFile.getDescendantsOfKind(
      SyntaxKind.VariableDeclaration,
    )) {
      if (!containsSensitiveName(declaration.getName())) {
        continue;
      }

      const initializer = declaration.getInitializer();

      if (!initializer) {
        continue;
      }

      const usesMathRandom = initializer
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .some((call) => {
          const expression = call.getExpression();

          return (
            Node.isPropertyAccessExpression(expression) &&
            expression.getExpression().getText() === "Math" &&
            expression.getName() === "random"
          );
        });

      if (!usesMathRandom) {
        continue;
      }

      findings.push(
        createFinding({
          node: declaration,
          ruleId: "ISO27001-RANDOM-001",
          framework: "iso27001",
          control: "ISO 27001:2022 A.8.24, A.8.28",
          severity: "high",
          title: "Weak randomness used for security value",
          description:
            "Math.random appears to generate a security sensitive value.",
          remediation:
            "Use a cryptographically secure random generator such as crypto.randomUUID or crypto.randomBytes.",
        }),
      );
    }

    return findings;
  },
};

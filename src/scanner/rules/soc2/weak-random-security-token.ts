import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import { containsSensitiveName } from "@/scanner/utils/names";

export const soc2WeakRandomSecurityTokenRule: ComplianceRule = {
  id: "SOC2-AUTH-001",
  framework: "soc2",
  control: "SOC 2 CC6.1",
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

      const insecureRandomCalls = initializer
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter((call) => {
          const expression = call.getExpression();

          return (
            Node.isPropertyAccessExpression(expression) &&
            expression.getExpression().getText() === "Math" &&
            expression.getName() === "random"
          );
        });

      if (insecureRandomCalls.length === 0) {
        continue;
      }

      findings.push(
        createFinding({
          node: declaration,
          ruleId: "SOC2-AUTH-001",
          framework: "soc2",
          control: "SOC 2 CC6.1",
          severity: "high",
          title: "Weak randomness used for security value",
          description:
            "Math.random is being used to generate a security sensitive value and is not cryptographically secure.",
          remediation:
            "Use a cryptographically secure random generator such as crypto.randomUUID or crypto.randomBytes.",
        }),
      );
    }

    return findings;
  },
};

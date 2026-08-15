import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";
import { containsSensitiveName } from "@/scanner/utils/names";

export const insecureRandomTokenRule: ComplianceRule = {
  id: "GDPR-SEC-002",
  framework: "gdpr",
  control: "GDPR Article 32",
  title: "Insecure randomness used for security sensitive value",

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

      const mathRandomCalls = initializer
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .filter((call) => {
          const expression = call.getExpression();

          return (
            Node.isPropertyAccessExpression(expression) &&
            expression.getExpression().getText() === "Math" &&
            expression.getName() === "random"
          );
        });

      if (mathRandomCalls.length === 0) {
        continue;
      }

      findings.push(
        createFinding({
          node: declaration,
          ruleId: "GDPR-SEC-002",
          framework: "gdpr",
          control: "GDPR Article 32",
          severity: "high",
          title: "Insecure randomness used for security sensitive value",
          description:
            "Math.random is not cryptographically secure and appears to be used to generate a security sensitive value.",
          remediation:
            "Use crypto.randomUUID, crypto.randomBytes, Web Crypto getRandomValues, or another cryptographically secure random generator.",
        }),
      );
    }

    return findings;
  },
};

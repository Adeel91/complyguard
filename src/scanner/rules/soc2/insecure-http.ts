import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";

export const soc2InsecureHttpRule: ComplianceRule = {
  id: "SOC2-TRANS-001",
  framework: "soc2",
  control: "SOC 2 CC6.7",
  title: "Unencrypted HTTP communication",

  analyze(sourceFile) {
    const findings = [];

    for (const call of sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression,
    )) {
      const expression = call.getExpression().getText();

      if (
        expression !== "fetch" &&
        expression !== "axios" &&
        expression !== "axios.get" &&
        expression !== "axios.post" &&
        expression !== "axios.put"
      ) {
        continue;
      }

      const firstArgument = call.getArguments()[0];

      if (!firstArgument || !Node.isStringLiteral(firstArgument)) {
        continue;
      }

      if (!firstArgument.getLiteralValue().startsWith("http://")) {
        continue;
      }

      findings.push(
        createFinding({
          node: call,
          ruleId: "SOC2-TRANS-001",
          framework: "soc2",
          control: "SOC 2 CC6.7",
          severity: "high",
          title: "Unencrypted HTTP communication",
          description:
            "The application communicates with a remote endpoint using unencrypted HTTP.",
          remediation:
            "Use HTTPS for remote communication and validate the security configuration of the destination service.",
        }),
      );
    }

    return findings;
  },
};

import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";

export const isoInsecureHttpRule: ComplianceRule = {
  id: "ISO27001-NET-001",
  framework: "iso27001",
  control: "ISO 27001:2022 A.8.20, A.8.24",
  title: "Unencrypted remote communication",

  analyze(sourceFile) {
    const findings = [];

    for (const call of sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression,
    )) {
      const expression = call.getExpression().getText();

      if (
        !["fetch", "axios", "axios.get", "axios.post", "axios.put"].includes(
          expression,
        )
      ) {
        continue;
      }

      const url = call.getArguments()[0];

      if (
        !url ||
        !Node.isStringLiteral(url) ||
        !url.getLiteralValue().startsWith("http://")
      ) {
        continue;
      }

      findings.push(
        createFinding({
          node: call,
          ruleId: "ISO27001-NET-001",
          framework: "iso27001",
          control: "ISO 27001:2022 A.8.20, A.8.24",
          severity: "high",
          title: "Unencrypted remote communication",
          description:
            "The application communicates with a remote service over unencrypted HTTP.",
          remediation:
            "Use HTTPS with certificate validation for remote communications.",
        }),
      );
    }

    return findings;
  },
};

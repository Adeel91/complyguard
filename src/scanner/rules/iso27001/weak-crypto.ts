import { Node, SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";

const WEAK_HASHES = new Set(["md5", "sha1", "sha-1"]);

export const isoWeakCryptoRule: ComplianceRule = {
  id: "ISO27001-CRYPTO-001",
  framework: "iso27001",
  control: "ISO 27001:2022 A.8.24",
  title: "Weak cryptographic hash algorithm",

  analyze(sourceFile) {
    const findings = [];

    for (const call of sourceFile.getDescendantsOfKind(
      SyntaxKind.CallExpression,
    )) {
      if (!call.getExpression().getText().endsWith("createHash")) {
        continue;
      }

      const algorithm = call.getArguments()[0];

      if (!algorithm || !Node.isStringLiteral(algorithm)) {
        continue;
      }

      if (!WEAK_HASHES.has(algorithm.getLiteralValue().toLowerCase())) {
        continue;
      }

      findings.push(
        createFinding({
          node: call,
          ruleId: "ISO27001-CRYPTO-001",
          framework: "iso27001",
          control: "ISO 27001:2022 A.8.24",
          severity: "high",
          title: "Weak cryptographic hash algorithm",
          description:
            "A security sensitive operation uses a cryptographic hash that is unsuitable for modern security use.",
          remediation:
            "Use a modern approved algorithm appropriate to the use case.",
        }),
      );
    }

    return findings;
  },
};

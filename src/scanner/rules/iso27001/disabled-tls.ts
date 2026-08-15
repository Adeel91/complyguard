import { SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";

export const isoDisabledTlsRule: ComplianceRule = {
  id: "ISO27001-TLS-001",
  framework: "iso27001",
  control: "ISO 27001:2022 A.8.20, A.8.24",
  title: "TLS verification explicitly disabled",

  analyze(sourceFile) {
    const findings = [];

    for (const property of sourceFile.getDescendantsOfKind(
      SyntaxKind.PropertyAssignment,
    )) {
      if (property.getName() !== "rejectUnauthorized") {
        continue;
      }

      const initializer = property.getInitializer();

      if (
        !initializer ||
        initializer.getKind() !== SyntaxKind.FalseKeyword
      ) {
        continue;
      }

      findings.push(
        createFinding({
          node: property,
          ruleId: "ISO27001-TLS-001",
          framework: "iso27001",
          control: "ISO 27001:2022 A.8.20, A.8.24",
          severity: "critical",
          title: "TLS verification explicitly disabled",
          description:
            "TLS certificate validation is explicitly disabled.",
          remediation:
            "Restore certificate verification and configure trusted certificate authorities correctly.",
        }),
      );
    }

    return findings;
  },
};

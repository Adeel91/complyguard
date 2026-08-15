import { SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";

const PRIVILEGED_TERMS = [
  "deleteUser",
  "deleteAccount",
  "disableUser",
  "grantRole",
  "revokeRole",
  "updateRole",
  "setAdmin",
];

const AUDIT_TERMS = [
  "audit",
  "auditLog",
  "logSecurityEvent",
  "recordAudit",
  "recordSecurityEvent",
];

export const privilegedActionWithoutAuditRule: ComplianceRule = {
  id: "SOC2-AUDIT-001",
  framework: "soc2",
  control: "SOC 2 CC7.2",
  title: "Privileged action without visible audit event",

  analyze(sourceFile) {
    const findings = [];

    for (const fn of sourceFile.getFunctions()) {
      const name = fn.getName();

      if (!name || !PRIVILEGED_TERMS.includes(name)) {
        continue;
      }

      const body = fn.getBody();

      if (!body) {
        continue;
      }

      const callNames = body
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .map((call) => call.getExpression().getText());

      const hasAuditCall = callNames.some((callName) =>
        AUDIT_TERMS.some((term) => callName.includes(term)),
      );

      if (hasAuditCall) {
        continue;
      }

      findings.push(
        createFinding({
          node: fn,
          ruleId: "SOC2-AUDIT-001",
          framework: "soc2",
          control: "SOC 2 CC7.2",
          severity: "medium",
          title: "Privileged action without visible audit event",
          description:
            "A privileged operation was detected without a visible audit event in the same function.",
          remediation:
            "Record a structured audit event containing the actor, action, target, timestamp, and outcome.",
        }),
      );
    }

    return findings;
  },
};

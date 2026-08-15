import { SyntaxKind } from "ts-morph";

import type { ComplianceRule } from "@/scanner/types/rule";
import { createFinding } from "@/scanner/utils/finding";

const PRIVILEGED_ACTIONS = [
  "deleteUser",
  "deleteAccount",
  "disableUser",
  "grantRole",
  "revokeRole",
  "setAdmin",
];

const AUDIT_NAMES = [
  "audit",
  "auditLog",
  "recordAudit",
  "logSecurityEvent",
  "recordSecurityEvent",
];

export const isoPrivilegedAuditRule: ComplianceRule = {
  id: "ISO27001-AUDIT-001",
  framework: "iso27001",
  control: "ISO 27001:2022 A.8.15",
  title: "Privileged action without visible audit event",

  analyze(sourceFile) {
    const findings = [];

    for (const fn of sourceFile.getFunctions()) {
      const name = fn.getName();

      if (!name || !PRIVILEGED_ACTIONS.includes(name)) {
        continue;
      }

      const body = fn.getBody();

      if (!body) {
        continue;
      }

      const calls = body
        .getDescendantsOfKind(SyntaxKind.CallExpression)
        .map((call) => call.getExpression().getText());

      const hasAudit = calls.some((callName) =>
        AUDIT_NAMES.some((auditName) =>
          callName.includes(auditName),
        ),
      );

      if (hasAudit) {
        continue;
      }

      findings.push(
        createFinding({
          node: fn,
          ruleId: "ISO27001-AUDIT-001",
          framework: "iso27001",
          control: "ISO 27001:2022 A.8.15",
          severity: "medium",
          title: "Privileged action without visible audit event",
          description:
            "A privileged operation was found without a visible audit event in the same function.",
          remediation:
            "Record a structured audit event containing actor, action, target, timestamp and outcome.",
        }),
      );
    }

    return findings;
  },
};

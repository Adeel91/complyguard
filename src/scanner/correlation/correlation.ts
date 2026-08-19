import {
  createHash,
} from "node:crypto";

import type {
  ComplianceFinding,
  FindingSeverity,
} from "@/scanner/types/finding";

import type {
  RootRisk,
  RootRiskControl,
} from "@/scanner/correlation/types";

const severityRank:
  Record<
    FindingSeverity,
    number
  > = {
    critical: 5,
    high: 4,
    medium: 3,
    low: 2,
    info: 1,
  };

export type RootRiskFamily =
  | "hardcoded-secret"
  | "credential-comparison"
  | "weak-security-randomness"
  | "insecure-transport"
  | "sensitive-logging"
  | "missing-audit-event"
  | "weak-cryptography"
  | "disabled-tls-verification"
  | "dynamic-code-execution"
  | "other";

const ruleFamilies:
  Record<
    string,
    RootRiskFamily
  > = {
    "GDPR-LOG-001":
      "sensitive-logging",

    "GDPR-SEC-001":
      "hardcoded-secret",

    "GDPR-AUTH-001":
      "credential-comparison",

    "GDPR-SEC-002":
      "weak-security-randomness",

    "GDPR-TRANS-001":
      "insecure-transport",

    "SOC2-SEC-001":
      "hardcoded-secret",

    "SOC2-TRANS-001":
      "insecure-transport",

    "SOC2-AUTH-001":
      "weak-security-randomness",

    "SOC2-AUDIT-001":
      "missing-audit-event",

    "SOC2-LOG-001":
      "sensitive-logging",

    "ISO27001-SEC-001":
      "hardcoded-secret",

    "ISO27001-NET-001":
      "insecure-transport",

    "ISO27001-CRYPTO-001":
      "weak-cryptography",

    "ISO27001-CODE-001":
      "dynamic-code-execution",

    "ISO27001-TLS-001":
      "disabled-tls-verification",

    "ISO27001-LOG-001":
      "sensitive-logging",

    "ISO27001-RANDOM-001":
      "weak-security-randomness",

    "ISO27001-AUDIT-001":
      "missing-audit-event",
  };

export function rootRiskFamilyForRule(
  ruleId: string,
): RootRiskFamily {
  return (
    ruleFamilies[
      ruleId
    ] ??
    "other"
  );
}

function fallbackCategoryForRule(
  ruleId: string,
): RootRisk["category"] {
  if (
    /AUTH|RANDOM/.test(
      ruleId,
    )
  ) {
    return "authentication";
  }

  if (
    /TRANS|NET|TLS/.test(
      ruleId,
    )
  ) {
    return "transport";
  }

  if (
    /LOG/.test(
      ruleId,
    )
  ) {
    return "logging";
  }

  if (
    /SEC/.test(
      ruleId,
    )
  ) {
    return "secrets";
  }

  if (
    /CRYPTO/.test(
      ruleId,
    )
  ) {
    return "cryptography";
  }

  if (
    /AUDIT/.test(
      ruleId,
    )
  ) {
    return "audit";
  }

  if (
    /CODE/.test(
      ruleId,
    )
  ) {
    return "code-execution";
  }

  return "other";
}

function categoryForFamily(
  family: RootRiskFamily,
  ruleId: string,
): RootRisk["category"] {
  switch (
    family
  ) {
    case "hardcoded-secret":
      return "secrets";

    case "credential-comparison":
    case "weak-security-randomness":
      return "authentication";

    case "insecure-transport":
    case "disabled-tls-verification":
      return "transport";

    case "sensitive-logging":
      return "logging";

    case "missing-audit-event":
      return "audit";

    case "weak-cryptography":
      return "cryptography";

    case "dynamic-code-execution":
      return "code-execution";

    case "other":
      return fallbackCategoryForRule(
        ruleId,
      );
  }
}

/**
 * Root-risk identity intentionally does not contain framework,
 * control ID, rule ID or exact evidence text.
 *
 * Multiple framework rules can describe the same underlying
 * engineering problem using different wording and AST nodes.
 *
 * File + source line + canonical engineering family gives those
 * signals one root-risk identity while preserving every original
 * finding inside rawFindings.
 */
function correlationKey(
  finding:
    ComplianceFinding,
): string {
  const family =
    rootRiskFamilyForRule(
      finding.ruleId,
    );

  return [
    finding.location.file,
    finding.location.line,
    family,
  ].join(
    "::",
  );
}

function highestSeverity(
  findings:
    ComplianceFinding[],
): FindingSeverity {
  return findings.reduce<
    FindingSeverity
  >(
    (
      highest,
      finding,
    ) =>
      severityRank[
        finding.severity
      ] >
      severityRank[
        highest
      ]
        ? finding.severity
        : highest,
    "info",
  );
}

function controlsFor(
  findings:
    ComplianceFinding[],
): RootRiskControl[] {
  const map =
    new Map<
      string,
      RootRiskControl
    >();

  for (
    const finding of
    findings
  ) {
    const key =
      `${finding.framework}::${finding.control}`;

    const existing =
      map.get(
        key,
      );

    if (
      existing
    ) {
      if (
        !existing.ruleIds.includes(
          finding.ruleId,
        )
      ) {
        existing.ruleIds.push(
          finding.ruleId,
        );
      }

      continue;
    }

    map.set(
      key,
      {
        framework:
          finding.framework,

        control:
          finding.control,

        ruleIds: [
          finding.ruleId,
        ],
      },
    );
  }

  return Array.from(
    map.values(),
  );
}

function titleFor(
  category:
    RootRisk["category"],

  findings:
    ComplianceFinding[],
): string {
  switch (
    category
  ) {
    case "authentication":
      return "Authentication or credential handling risk";

    case "transport":
      return "Insecure transport or TLS configuration";

    case "logging":
      return "Sensitive data exposure through logging";

    case "secrets":
      return "Hardcoded or exposed secret";

    case "cryptography":
      return "Weak cryptographic practice";

    case "audit":
      return "Missing audit trail for privileged action";

    case "code-execution":
      return "Dynamic code execution risk";

    default:
      return (
        findings[0]
          ?.title ??
        "Compliance related engineering risk"
      );
  }
}

export function correlateFindings(
  findings:
    ComplianceFinding[],
): RootRisk[] {
  const groups =
    new Map<
      string,
      ComplianceFinding[]
    >();

  for (
    const finding of
    findings
  ) {
    const key =
      correlationKey(
        finding,
      );

    const group =
      groups.get(
        key,
      ) ?? [];

    group.push(
      finding,
    );

    groups.set(
      key,
      group,
    );
  }

  return Array.from(
    groups.entries(),
  ).map(
    (
      [
        key,
        group,
      ],
    ) => {
      const first =
        group[0];

      if (
        !first
      ) {
        throw new Error(
          "Root-risk correlation produced an empty finding group.",
        );
      }

      const family =
        rootRiskFamilyForRule(
          first.ruleId,
        );

      const category =
        categoryForFamily(
          family,
          first.ruleId,
        );

      return {
        id:
          `risk_${createHash("sha256")
            .update(
              key,
            )
            .digest(
              "hex",
            )
            .slice(
              0,
              20,
            )}`,

        title:
          titleFor(
            category,
            group,
          ),

        severity:
          highestSeverity(
            group,
          ),

        category,

        evidence: {
          file:
            first.location.file,

          line:
            first.location.line,

          column:
            first.location.column,

          snippets:
            Array.from(
              new Set(
                group.map(
                  (
                    finding,
                  ) =>
                    finding.evidence,
                ),
              ),
            ),
        },

        controls:
          controlsFor(
            group,
          ),

        rawFindings:
          group,

        signalCount:
          group.length,
      };
    },
  );
}

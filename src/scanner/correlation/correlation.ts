import type { ComplianceFinding, FindingSeverity } from "@/scanner/types/finding";
import type { RootRisk, RootRiskControl } from "@/scanner/correlation/types";

const severityRank: Record<FindingSeverity, number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

function categoryForRule(ruleId: string): RootRisk["category"] {
  if (/AUTH|RANDOM/.test(ruleId)) return "authentication";
  if (/TRANS|NET|TLS/.test(ruleId)) return "transport";
  if (/LOG/.test(ruleId)) return "logging";
  if (/SEC/.test(ruleId)) return "secrets";
  if (/CRYPTO/.test(ruleId)) return "cryptography";
  if (/AUDIT/.test(ruleId)) return "audit";
  if (/CODE/.test(ruleId)) return "code-execution";

  return "other";
}

function normalizedEvidence(finding: ComplianceFinding): string {
  return finding.evidence
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function correlationKey(finding: ComplianceFinding): string {
  return [
    finding.location.file,
    finding.location.line,
    categoryForRule(finding.ruleId),
    normalizedEvidence(finding),
  ].join("::");
}

function highestSeverity(findings: ComplianceFinding[]): FindingSeverity {
  return findings.reduce<FindingSeverity>(
    (highest, finding) =>
      severityRank[finding.severity] > severityRank[highest]
        ? finding.severity
        : highest,
    "info",
  );
}

function controlsFor(findings: ComplianceFinding[]): RootRiskControl[] {
  const map = new Map<string, RootRiskControl>();

  for (const finding of findings) {
    const key = `${finding.framework}::${finding.control}`;
    const existing = map.get(key);

    if (existing) {
      if (!existing.ruleIds.includes(finding.ruleId)) {
        existing.ruleIds.push(finding.ruleId);
      }
      continue;
    }

    map.set(key, {
      framework: finding.framework,
      control: finding.control,
      ruleIds: [finding.ruleId],
    });
  }

  return Array.from(map.values());
}

function titleFor(
  category: RootRisk["category"],
  findings: ComplianceFinding[],
): string {
  switch (category) {
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
      return findings[0]?.title ?? "Compliance related engineering risk";
  }
}

export function correlateFindings(
  findings: ComplianceFinding[],
): RootRisk[] {
  const groups = new Map<string, ComplianceFinding[]>();

  for (const finding of findings) {
    const key = correlationKey(finding);
    const group = groups.get(key) ?? [];
    group.push(finding);
    groups.set(key, group);
  }

  return Array.from(groups.entries()).map(([key, group]) => {
    const first = group[0];
    const category = categoryForRule(first.ruleId);

    return {
      id: Buffer.from(key).toString("base64url").slice(0, 24),
      title: titleFor(category, group),
      severity: highestSeverity(group),
      category,
      evidence: {
        file: first.location.file,
        line: first.location.line,
        column: first.location.column,
        snippets: Array.from(
          new Set(group.map((finding) => finding.evidence)),
        ),
      },
      controls: controlsFor(group),
      rawFindings: group,
      signalCount: group.length,
    };
  });
}

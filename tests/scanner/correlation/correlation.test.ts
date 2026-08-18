import { describe, expect, it } from "vitest";

import { correlateFindings } from "@/scanner/correlation";
import type { ComplianceFinding } from "@/scanner/types/finding";

function finding(
  overrides: Partial<ComplianceFinding> & Pick<ComplianceFinding, "ruleId" | "framework" | "control">,
): ComplianceFinding {
  return {
    ruleId: overrides.ruleId,
    framework: overrides.framework,
    control: overrides.control,
    severity: overrides.severity ?? "high",
    title: overrides.title ?? "Test finding",
    description: overrides.description ?? "Test description",
    evidence: overrides.evidence ?? 'fetch("http://example.com")',
    remediation: overrides.remediation ?? "Use HTTPS",
    location: overrides.location ?? {
      file: "src/users.ts",
      line: 13,
      column: 10,
    },
  };
}

describe("finding correlation", () => {
  it("groups cross framework findings that describe the same root risk", () => {
    const rootRisks = correlateFindings([
      finding({
        ruleId: "GDPR-TRANS-001",
        framework: "gdpr",
        control: "GDPR Article 32",
        severity: "critical",
      }),
      finding({
        ruleId: "SOC2-TRANS-001",
        framework: "soc2",
        control: "SOC 2 CC6.7",
      }),
      finding({
        ruleId: "ISO27001-NET-001",
        framework: "iso27001",
        control: "ISO 27001:2022 A.8.20, A.8.24",
      }),
    ]);

    expect(rootRisks).toHaveLength(1);
    expect(rootRisks[0].signalCount).toBe(3);
    expect(rootRisks[0].controls).toHaveLength(3);
    expect(rootRisks[0].severity).toBe("critical");
    expect(rootRisks[0].category).toBe("transport");
  });

  it("does not merge unrelated findings", () => {
    const rootRisks = correlateFindings([
      finding({
        ruleId: "GDPR-TRANS-001",
        framework: "gdpr",
        control: "GDPR Article 32",
      }),
      finding({
        ruleId: "GDPR-LOG-001",
        framework: "gdpr",
        control: "GDPR Article 32",
        evidence: "console.log(user.email)",
        location: {
          file: "src/users.ts",
          line: 10,
          column: 3,
        },
      }),
    ]);

    expect(rootRisks).toHaveLength(2);
  });
});

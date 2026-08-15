import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { scanProject } from "@/scanner/core/scanner";
import { soc2Rules } from "@/scanner/rules/soc2";

const vulnerablePath = resolve(
  process.cwd(),
  "tests/fixtures/soc2/vulnerable",
);

const compliantPath = resolve(
  process.cwd(),
  "tests/fixtures/soc2/compliant",
);

describe("SOC 2 rules", () => {
  it("detects risky source patterns", () => {
    const result = scanProject(vulnerablePath, soc2Rules);

    const ruleIds = new Set(
      result.findings.map((finding) => finding.ruleId),
    );

    expect(ruleIds).toContain("SOC2-SEC-001");
    expect(ruleIds).toContain("SOC2-TRANS-001");
    expect(ruleIds).toContain("SOC2-AUTH-001");
    expect(ruleIds).toContain("SOC2-AUDIT-001");
    expect(ruleIds).toContain("SOC2-LOG-001");
  });

  it("does not flag equivalent safe implementations", () => {
    const result = scanProject(compliantPath, soc2Rules);

    expect(result.findings).toHaveLength(0);
  });

  it("returns evidence and source locations", () => {
    const result = scanProject(vulnerablePath, soc2Rules);

    expect(result.findings.length).toBeGreaterThan(0);

    for (const finding of result.findings) {
      expect(finding.location.file.length).toBeGreaterThan(0);
      expect(finding.location.line).toBeGreaterThan(0);
      expect(finding.location.column).toBeGreaterThan(0);
      expect(finding.evidence.length).toBeGreaterThan(0);
      expect(finding.control.length).toBeGreaterThan(0);
      expect(finding.remediation.length).toBeGreaterThan(0);
    }
  });
});

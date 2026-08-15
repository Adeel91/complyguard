import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { scanProject } from "@/scanner/core/scanner";
import { gdprRules } from "@/scanner/rules/gdpr";

const vulnerablePath = resolve(
  process.cwd(),
  "tests/fixtures/gdpr/vulnerable",
);

const compliantPath = resolve(
  process.cwd(),
  "tests/fixtures/gdpr/compliant",
);

describe("GDPR rules", () => {
  it("detects real risky patterns", () => {
    const result = scanProject(vulnerablePath, gdprRules);

    const ruleIds = new Set(
      result.findings.map((finding) => finding.ruleId),
    );

    expect(ruleIds).toContain("GDPR-LOG-001");
    expect(ruleIds).toContain("GDPR-SEC-001");
    expect(ruleIds).toContain("GDPR-AUTH-001");
    expect(ruleIds).toContain("GDPR-SEC-002");
    expect(ruleIds).toContain("GDPR-TRANS-001");
  });

  it("does not flag equivalent safe patterns", () => {
    const result = scanProject(compliantPath, gdprRules);

    expect(result.findings).toHaveLength(0);
  });

  it("returns source evidence and locations", () => {
    const result = scanProject(vulnerablePath, gdprRules);

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

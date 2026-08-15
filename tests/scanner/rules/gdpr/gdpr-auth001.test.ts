import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { scanProject } from "@/scanner/core/scanner";
import { insecurePasswordComparisonRule } from "@/scanner/rules/gdpr/insecure-password-comparison";

const vulnerablePath = resolve(
  process.cwd(),
  "tests/fixtures/gdpr/vulnerable",
);

const compliantPath = resolve(
  process.cwd(),
  "tests/fixtures/gdpr/compliant",
);

describe("GDPR-AUTH-001 insecure password comparison", () => {
  it("flags direct equality comparison of plaintext credentials", () => {
    const result = scanProject(vulnerablePath, [
      insecurePasswordComparisonRule,
    ]);

    const ids = result.findings.map((f) => f.ruleId);

    expect(ids).toContain("GDPR-AUTH-001");
  });

  it("includes evidence and source location for each finding", () => {
    const result = scanProject(vulnerablePath, [
      insecurePasswordComparisonRule,
    ]);

    const authFindings = result.findings.filter(
      (f) => f.ruleId === "GDPR-AUTH-001",
    );

    expect(authFindings.length).toBeGreaterThan(0);

    for (const finding of authFindings) {
      expect(finding.evidence.length).toBeGreaterThan(0);
      expect(finding.location.file.length).toBeGreaterThan(0);
      expect(finding.location.line).toBeGreaterThan(0);
      expect(finding.location.column).toBeGreaterThan(0);
      expect(finding.control.length).toBeGreaterThan(0);
      expect(finding.remediation.length).toBeGreaterThan(0);
    }
  });

  it("does not flag null/boolean guards or hashed comparisons", () => {
    const result = scanProject(compliantPath, [
      insecurePasswordComparisonRule,
    ]);

    const authFindings = result.findings.filter(
      (f) => f.ruleId === "GDPR-AUTH-001",
    );

    expect(authFindings).toHaveLength(0);
  });
});

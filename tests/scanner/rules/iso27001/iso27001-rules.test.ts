import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { scanProject } from "@/scanner/core/scanner";
import { iso27001Rules } from "@/scanner/rules/iso27001";

const vulnerablePath = resolve(
  process.cwd(),
  "tests/fixtures/iso27001/vulnerable",
);

const compliantPath = resolve(
  process.cwd(),
  "tests/fixtures/iso27001/compliant",
);

describe("ISO 27001 rules", () => {
  it("detects mapped security risks", () => {
    const result = scanProject(
      vulnerablePath,
      iso27001Rules,
    );

    const ids = new Set(
      result.findings.map((finding) => finding.ruleId),
    );

    expect(ids).toContain("ISO27001-SEC-001");
    expect(ids).toContain("ISO27001-NET-001");
    expect(ids).toContain("ISO27001-CRYPTO-001");
    expect(ids).toContain("ISO27001-CODE-001");
    expect(ids).toContain("ISO27001-TLS-001");
    expect(ids).toContain("ISO27001-LOG-001");
    expect(ids).toContain("ISO27001-RANDOM-001");
    expect(ids).toContain("ISO27001-AUDIT-001");
  });

  it("does not flag safe equivalents", () => {
    const result = scanProject(
      compliantPath,
      iso27001Rules,
    );

    expect(result.findings).toHaveLength(0);
  });
});

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

describe(
  "root risk identity",
  () => {
    it(
      "does not collide when findings share the same absolute path prefix",
      () => {
        const sharedPrefix =
          "/Users/example/Projects/complyguard/demo/vulnerable-app/src";

        const findings = [
          {
            ruleId:
              "GDPR-SEC-002",

            framework:
              "gdpr" as const,

            control:
              "Article 32",

            severity:
              "high" as const,

            title:
              "Weak random token",

            description:
              "Authentication token uses weak randomness.",

            evidence:
              "Math.random()",

            remediation:
              "Use cryptographically secure randomness.",

            location: {
              file:
                `${sharedPrefix}/auth.ts`,

              line:
                10,

              column:
                3,
            },
          },

          {
            ruleId:
              "SOC2-LOG-001",

            framework:
              "soc2" as const,

            control:
              "CC7",

            severity:
              "medium" as const,

            title:
              "Sensitive logging",

            description:
              "Sensitive information is written to logs.",

            evidence:
              "console.log(user.email)",

            remediation:
              "Remove sensitive data from logs.",

            location: {
              file:
                `${sharedPrefix}/users.ts`,

              line:
                20,

              column:
                3,
            },
          },

          {
            ruleId:
              "ISO27001-NET-001",

            framework:
              "iso27001" as const,

            control:
              "A.8",

            severity:
              "high" as const,

            title:
              "Insecure transport",

            description:
              "HTTP is used for sensitive traffic.",

            evidence:
              'fetch("http://example.test")',

            remediation:
              "Use HTTPS.",

            location: {
              file:
                `${sharedPrefix}/network.ts`,

              line:
                30,

              column:
                3,
            },
          },
        ];

        const risks =
          correlateFindings(
            findings,
          );

        expect(
          risks,
        ).toHaveLength(
          3,
        );

        const ids =
          risks.map(
            (risk) =>
              risk.id,
          );

        expect(
          new Set(ids).size,
        ).toBe(
          3,
        );

        for (
          const id of ids
        ) {
          expect(
            id,
          ).toMatch(
            /^risk_[a-f0-9]{20}$/,
          );
        }
      },
    );

    it(
      "produces deterministic IDs for the same risk",
      () => {
        const finding = {
          ruleId:
            "GDPR-SEC-002",

          framework:
            "gdpr" as const,

          control:
            "Article 32",

          severity:
            "high" as const,

          title:
            "Weak random token",

          description:
            "Authentication token uses weak randomness.",

          evidence:
            "Math.random()",

          remediation:
            "Use cryptographically secure randomness.",

          location: {
            file:
              "/project/src/auth.ts",

            line:
              10,

            column:
              3,
          },
        };

        const first =
          correlateFindings([
            finding,
          ]);

        const second =
          correlateFindings([
            finding,
          ]);

        expect(
          first[0]?.id,
        ).toBe(
          second[0]?.id,
        );
      },
    );
  },
);


describe(
  "semantic cross-framework correlation",
  () => {
    it(
      "collapses three framework rules describing the same weak random token",
      () => {
        const file =
          "/project/src/auth.ts";

        const findings = [
          {
            ruleId:
              "GDPR-SEC-002",

            framework:
              "gdpr" as const,

            control:
              "Article 32",

            severity:
              "high" as const,

            title:
              "Weak security token",

            description:
              "Security token uses weak randomness.",

            evidence:
              "Math.random()",

            remediation:
              "Use cryptographically secure randomness.",

            location: {
              file,

              line:
                9,

              column:
                20,
            },
          },

          {
            ruleId:
              "SOC2-AUTH-001",

            framework:
              "soc2" as const,

            control:
              "CC6.1",

            severity:
              "high" as const,

            title:
              "Weak authentication randomness",

            description:
              "Access token uses weak randomness.",

            evidence:
              "Math.random().toString(36)",

            remediation:
              "Use crypto.randomUUID.",

            location: {
              file,

              line:
                9,

              column:
                23,
            },
          },

          {
            ruleId:
              "ISO27001-RANDOM-001",

            framework:
              "iso27001" as const,

            control:
              "A.8.24",

            severity:
              "high" as const,

            title:
              "Insecure random token",

            description:
              "Security-sensitive randomness is weak.",

            evidence:
              "const accessToken = Math.random().toString(36)",

            remediation:
              "Use cryptographically secure randomness.",

            location: {
              file,

              line:
                9,

              column:
                9,
            },
          },
        ];

        const risks =
          correlateFindings(
            findings,
          );

        expect(
          risks,
        ).toHaveLength(
          1,
        );

        expect(
          risks[0]
            ?.signalCount,
        ).toBe(
          3,
        );

        expect(
          risks[0]
            ?.rawFindings,
        ).toHaveLength(
          3,
        );

        expect(
          new Set(
            risks[0]
              ?.controls
              .map(
                (
                  control,
                ) =>
                  control.framework,
              ),
          ),
        ).toEqual(
          new Set([
            "gdpr",
            "soc2",
            "iso27001",
          ]),
        );
      },
    );

    it(
      "keeps different engineering families separate on the same source line",
      () => {
        const file =
          "/project/src/example.ts";

        const findings = [
          {
            ruleId:
              "SOC2-LOG-001",

            framework:
              "soc2" as const,

            control:
              "CC7",

            severity:
              "medium" as const,

            title:
              "Sensitive logging",

            description:
              "Personal information is written to logs.",

            evidence:
              "console.log(user.email)",

            remediation:
              "Remove personal information from logs.",

            location: {
              file,

              line:
                20,

              column:
                1,
            },
          },

          {
            ruleId:
              "ISO27001-NET-001",

            framework:
              "iso27001" as const,

            control:
              "A.8",

            severity:
              "high" as const,

            title:
              "Insecure transport",

            description:
              "Personal information is transmitted over HTTP.",

            evidence:
              "fetch('http://example.test')",

            remediation:
              "Use HTTPS.",

            location: {
              file,

              line:
                20,

              column:
                25,
            },
          },
        ];

        const risks =
          correlateFindings(
            findings,
          );

        expect(
          risks,
        ).toHaveLength(
          2,
        );
      },
    );
  },
);

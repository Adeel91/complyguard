import {
  describe,
  expect,
  it,
} from "vitest";

import {
  calculateEngineeringPosture,
} from "@/scanner/scoring/posture-score";
import type {
  ComplianceFinding,
} from "@/scanner/types/finding";

function finding(
  severity:
    | "critical"
    | "high"
    | "medium"
    | "low"
    | "info",
): ComplianceFinding {
  return {
    ruleId:
      `TEST-${severity}`,
    framework: "gdpr",
    control:
      "GDPR Article 32",
    severity,
    title: "Test",
    description:
      "Test finding",
    evidence: "test()",
    remediation: "Fix it",
    location: {
      file: "/tmp/test.ts",
      line: 1,
      column: 1,
    },
  };
}

describe(
  "engineering posture",
  () => {
    it(
      "reduces observed posture when deterministic findings exist",
      () => {
        const posture =
          calculateEngineeringPosture(
            [
              finding(
                "critical",
              ),
              finding("high"),
            ],
            ["gdpr"],
          );

        expect(
          posture.score,
        ).toBeLessThan(
          100,
        );

        expect(
          posture.frameworks[0]
            .criticalCount,
        ).toBe(1);
      },
    );

    it(
      "describes the score as observed engineering posture rather than certification",
      () => {
        const posture =
          calculateEngineeringPosture(
            [],
            ["gdpr"],
          );

        expect(
          posture.disclaimer.toLowerCase(),
        ).toContain(
          "not a compliance certification",
        );
      },
    );
  },
);

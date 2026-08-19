import {
  describe,
  expect,
  it,
} from "vitest";

import type {
  RootRisk,
} from "@/scanner/correlation/types";

import {
  verifyRemediation,
} from "@/verification/remediation-verifier";

function createRisk(
  {
    id,
    root,
    file,
    line,
    ruleId,
    evidence,
  }: {
    id:
      string;

    root:
      string;

    file:
      string;

    line:
      number;

    ruleId:
      string;

    evidence:
      string;
  },
): RootRisk {
  const framework =
    ruleId.startsWith(
      "SOC2",
    )
      ? "soc2"
      : ruleId.startsWith(
            "ISO27001",
          )
        ? "iso27001"
        : "gdpr";

  const absoluteFile =
    `${root}/${file}`;

  return {
    id,

    title:
      "Test risk",

    severity:
      "high",

    category:
      ruleId.includes(
        "LOG",
      )
        ? "logging"
        : "authentication",

    evidence: {
      file:
        absoluteFile,

      line,

      column:
        1,

      snippets: [
        evidence,
      ],
    },

    controls: [
      {
        framework,

        control:
          "test-control",

        ruleIds: [
          ruleId,
        ],
      },
    ],

    rawFindings: [
      {
        ruleId,

        framework,

        control:
          "test-control",

        severity:
          "high",

        title:
          "Test finding",

        description:
          "Test deterministic finding.",

        evidence,

        remediation:
          "Fix the source pattern.",

        location: {
          file:
            absoluteFile,

          line,

          column:
            1,
        },
      },
    ],

    signalCount:
      1,
  };
}

describe(
  "verifyRemediation",
  () => {
    it(
      "keeps the same risk persisting even when its line moves",
      () => {
        const before =
          createRisk({
            id:
              "risk-before",

            root:
              "/before",

            file:
              "src/auth.ts",

            line:
              9,

            ruleId:
              "GDPR-SEC-002",

            evidence:
              "Math.random()",
          });

        const after =
          createRisk({
            id:
              "risk-after",

            root:
              "/after",

            file:
              "src/auth.ts",

            line:
              15,

            ruleId:
              "GDPR-SEC-002",

            evidence:
              "Math.random()",
          });

        const result =
          verifyRemediation({
            beforeProjectRoot:
              "/before",

            afterProjectRoot:
              "/after",

            beforeRootRisks: [
              before,
            ],

            afterRootRisks: [
              after,
            ],
          });

        expect(
          result.persisting,
        ).toHaveLength(
          1,
        );

        expect(
          result.resolved,
        ).toHaveLength(
          0,
        );

        expect(
          result.introduced,
        ).toHaveLength(
          0,
        );
      },
    );

    it(
      "marks a risk resolved when its deterministic evidence disappears",
      () => {
        const before =
          createRisk({
            id:
              "risk-before",

            root:
              "/before",

            file:
              "src/auth.ts",

            line:
              9,

            ruleId:
              "GDPR-SEC-002",

            evidence:
              "Math.random()",
          });

        const result =
          verifyRemediation({
            beforeProjectRoot:
              "/before",

            afterProjectRoot:
              "/after",

            beforeRootRisks: [
              before,
            ],

            afterRootRisks:
              [],
          });

        expect(
          result.resolved,
        ).toHaveLength(
          1,
        );

        expect(
          result.persisting,
        ).toHaveLength(
          0,
        );

        expect(
          result.introduced,
        ).toHaveLength(
          0,
        );
      },
    );

    it(
      "reports newly introduced deterministic evidence",
      () => {
        const after =
          createRisk({
            id:
              "risk-new",

            root:
              "/after",

            file:
              "src/users.ts",

            line:
              20,

            ruleId:
              "GDPR-LOG-001",

            evidence:
              "console.log(user.email)",
          });

        const result =
          verifyRemediation({
            beforeProjectRoot:
              "/before",

            afterProjectRoot:
              "/after",

            beforeRootRisks:
              [],

            afterRootRisks: [
              after,
            ],
          });

        expect(
          result.introduced,
        ).toHaveLength(
          1,
        );

        expect(
          result.resolved,
        ).toHaveLength(
          0,
        );
      },
    );

    it(
      "does not confuse different evidence in the same file and family",
      () => {
        const before =
          createRisk({
            id:
              "risk-email",

            root:
              "/before",

            file:
              "src/users.ts",

            line:
              10,

            ruleId:
              "GDPR-LOG-001",

            evidence:
              "console.log(user.email)",
          });

        const after =
          createRisk({
            id:
              "risk-address",

            root:
              "/after",

            file:
              "src/users.ts",

            line:
              20,

            ruleId:
              "GDPR-LOG-001",

            evidence:
              "console.log(user.address)",
          });

        const result =
          verifyRemediation({
            beforeProjectRoot:
              "/before",

            afterProjectRoot:
              "/after",

            beforeRootRisks: [
              before,
            ],

            afterRootRisks: [
              after,
            ],
          });

        expect(
          result.resolved,
        ).toHaveLength(
          1,
        );

        expect(
          result.introduced,
        ).toHaveLength(
          1,
        );

        expect(
          result.persisting,
        ).toHaveLength(
          0,
        );
      },
    );

    it(
      "normalizes harmless evidence whitespace",
      () => {
        const before =
          createRisk({
            id:
              "risk-before",

            root:
              "/before",

            file:
              "src/auth.ts",

            line:
              9,

            ruleId:
              "GDPR-SEC-002",

            evidence:
              "const token =   Math.random()",
          });

        const after =
          createRisk({
            id:
              "risk-after",

            root:
              "/after",

            file:
              "src/auth.ts",

            line:
              11,

            ruleId:
              "GDPR-SEC-002",

            evidence:
              "const token = Math.random()",
          });

        const result =
          verifyRemediation({
            beforeProjectRoot:
              "/before",

            afterProjectRoot:
              "/after",

            beforeRootRisks: [
              before,
            ],

            afterRootRisks: [
              after,
            ],
          });

        expect(
          result.persisting,
        ).toHaveLength(
          1,
        );
      },
    );
  },
);

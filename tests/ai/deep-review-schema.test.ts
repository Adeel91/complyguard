import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DeepReviewValidationError,
  parseDeepReviewResponse,
} from "@/ai/deep-review-schema";

import type {
  DeepReviewRequest,
} from "@/ai/types";

function request(): DeepReviewRequest {
  return {
    repository:
      "demo/vulnerable-app",

    generatedAt:
      "2026-08-18T00:00:00.000Z",

    frameworks: [
      "gdpr",
      "soc2",
      "iso27001",
    ],

    repositoryProfile: {
      primaryLanguage:
        "typescript",

      sourceFileCount:
        1,

      packageFiles: [],

      technologies: [],

      riskSurfaces: [],

      sourceAreas: {
        authentication: [],
        api: [],
        database: [],
        payments: [],
        security: [],
      },
    },

    posture: {
      score: 86,

      frameworks: [],

      methodology:
        "test methodology",

      disclaimer:
        "test disclaimer",
    },

    rootRisks: [
      {
        id:
          "risk-auth",

        title:
          "Weak authentication token generation",

        severity:
          "high",

        category:
          "authentication",

        evidence: {
          file:
            "src/auth.ts",

          line: 4,

          column: 1,

          snippets: [
            "const token = Math.random();",
          ],
        },

        controls: [
          {
            framework:
              "gdpr",

            control:
              "Article 32",

            ruleIds: [
              "GDPR-SEC-002",
            ],
          },
        ],

        rawFindings: [],

        signalCount:
          1,
      },
    ],

    contexts: [
      {
        rootRiskId:
          "risk-auth",

        file:
          "src/auth.ts",

        startLine:
          1,

        endLine:
          8,

        content:
          "4 | const token = Math.random();",
      },
    ],
  };
}

describe(
  "parseDeepReviewResponse",
  () => {
    it(
      "accepts a complete root-risk review",
      () => {
        const raw =
          JSON.stringify({
            executiveSummary:
              "The supplied authentication risk is supported by the source context.",

            reviews: [
              {
                rootRiskId:
                  "risk-auth",

                verdict:
                  "confirmed",

                confidence:
                  0.94,

                evidenceAdequacy:
                  "sufficient",

                reasoning:
                  "The token is generated directly with Math.random in authentication code.",

                businessImpact:
                  "Predictable token generation can weaken session or access-token integrity.",

                remediationPlan: [
                  "Replace Math.random with a cryptographically secure token source.",
                ],

                suggestedPatch:
                  null,
              },
            ],
          });

        const result =
          parseDeepReviewResponse(
            raw,
            request(),
          );

        expect(
          result.provider,
        ).toBe(
          "kiro",
        );

        expect(
          result.reviews,
        ).toHaveLength(
          1,
        );

        expect(
          result.reviews[0]
            ?.rootRiskId,
        ).toBe(
          "risk-auth",
        );
      },
    );

    it(
      "accepts fenced JSON but still validates it strictly",
      () => {
        const raw = `
\`\`\`json
{
  "executiveSummary": "Review complete.",
  "reviews": [
    {
      "rootRiskId": "risk-auth",
      "verdict": "needs-review",
      "confidence": 0.45,
      "evidenceAdequacy": "partial",
      "reasoning": "The local expression is visible but broader authentication flow is not.",
      "businessImpact": "The surrounding authentication behavior needs additional inspection.",
      "remediationPlan": [
        "Inspect token consumption and validation before changing behavior."
      ],
      "suggestedPatch": null
    }
  ]
}
\`\`\`
`;

        expect(
          parseDeepReviewResponse(
            raw,
            request(),
          ).reviews[0]
            ?.verdict,
        ).toBe(
          "needs-review",
        );
      },
    );

    it(
      "rejects an invented root risk",
      () => {
        const raw =
          JSON.stringify({
            executiveSummary:
              "Review complete.",

            reviews: [
              {
                rootRiskId:
                  "invented-risk",

                verdict:
                  "confirmed",

                confidence:
                  1,

                evidenceAdequacy:
                  "sufficient",

                reasoning:
                  "Invented reasoning.",

                businessImpact:
                  "Invented impact.",

                remediationPlan: [
                  "Invented remediation.",
                ],

                suggestedPatch:
                  null,
              },
            ],
          });

        expect(
          () =>
            parseDeepReviewResponse(
              raw,
              request(),
            ),
        ).toThrow(
          DeepReviewValidationError,
        );
      },
    );

    it(
      "rejects missing root-risk coverage",
      () => {
        const input =
          request();

        input.rootRisks.push({
          ...input.rootRisks[0]!,

          id:
            "risk-second",

          title:
            "Second risk",
        });

        const raw =
          JSON.stringify({
            executiveSummary:
              "Incomplete review.",

            reviews: [
              {
                rootRiskId:
                  "risk-auth",

                verdict:
                  "confirmed",

                confidence:
                  0.8,

                evidenceAdequacy:
                  "sufficient",

                reasoning:
                  "First risk only.",

                businessImpact:
                  "Impact.",

                remediationPlan: [
                  "Fix it.",
                ],

                suggestedPatch:
                  null,
              },
            ],
          });

        expect(
          () =>
            parseDeepReviewResponse(
              raw,
              input,
            ),
        ).toThrow(
          /Missing/,
        );
      },
    );
  },
);

describe(
  "Kiro response compatibility",
  () => {
    it(
      "accepts an omitted patch rationale",
      () => {
        const input =
          request();

        const raw =
          JSON.stringify({
            executiveSummary:
              "Review complete.",

            reviews: [
              {
                rootRiskId:
                  "risk-auth",

                verdict:
                  "confirmed",

                confidence:
                  0.9,

                evidenceAdequacy:
                  "sufficient",

                reasoning:
                  "The supplied source supports the risk.",

                businessImpact:
                  "The implementation can weaken authentication integrity.",

                remediationPlan: [
                  "Use a cryptographically secure token generator.",
                ],

                suggestedPatch: {
                  file:
                    "src/auth.ts",

                  diff:
                    "--- a/src/auth.ts\\n+++ b/src/auth.ts\\n@@ -1 +1 @@\\n-Math.random()\\n+crypto.randomUUID()",
                },
              },
            ],
          });

        const result =
          parseDeepReviewResponse(
            raw,
            input,
          );

        expect(
          result.reviews[0]
            ?.suggestedPatch
            ?.file,
        ).toBe(
          "src/auth.ts",
        );
      },
    );

    it(
      "normalizes an omitted suggestedPatch to null",
      () => {
        const input =
          request();

        const raw =
          JSON.stringify({
            executiveSummary:
              "Review complete.",

            reviews: [
              {
                rootRiskId:
                  "risk-auth",

                verdict:
                  "needs-review",

                confidence:
                  0.5,

                evidenceAdequacy:
                  "partial",

                reasoning:
                  "Additional context is required.",

                businessImpact:
                  "The authentication behavior cannot yet be classified confidently.",

                remediationPlan: [
                  "Inspect the token consumer before changing the implementation.",
                ]
              },
            ],
          });

        const result =
          parseDeepReviewResponse(
            raw,
            input,
          );

        expect(
          result.reviews[0]
            ?.suggestedPatch,
        ).toBeNull();
      },
    );
  },
);

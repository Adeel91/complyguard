import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildDeepReviewRequest,
} from "@/ai/request-builder";

describe(
  "buildDeepReviewRequest",
  () => {
    it(
      "preserves deterministic evidence and repository intelligence",
      () => {
        const request =
          buildDeepReviewRequest({
            repository:
              "demo/vulnerable-app",

            frameworks: [
              "gdpr",
              "soc2",
            ],

            repositoryProfile: {
              primaryLanguage:
                "typescript",

              sourceFileCount:
                4,

              packageFiles: [
                "package.json",
              ],

              technologies: [],

              riskSurfaces: [],

              sourceAreas: {
                authentication: [
                  "src/auth.ts",
                ],

                api: [],

                database: [],

                payments: [],

                security: [],
              },
            },

            posture: {
              score: 79,

              frameworks: [],

              methodology:
                "deterministic test methodology",

              disclaimer:
                "not compliance certification",
            },

            rootRisks: [
              {
                id:
                  "risk-authentication",

                title:
                  "Weak authentication token generation",

                severity:
                  "high",

                category:
                  "authentication",

                evidence: {
                  file:
                    "src/auth.ts",

                  line:
                    5,

                  column:
                    17,

                  snippets: [
                    "Math.random()",
                  ],
                },

                controls: [],

                rawFindings: [],

                signalCount:
                  1,
              },
            ],

            contexts: [
              {
                rootRiskId:
                  "risk-authentication",

                file:
                  "src/auth.ts",

                startLine:
                  1,

                endLine:
                  10,

                content:
                  "5 | const token = Math.random();",
              },
            ],
          });

        expect(
          request.repository,
        ).toBe(
          "demo/vulnerable-app",
        );

        expect(
          request.rootRisks,
        ).toHaveLength(
          1,
        );

        expect(
          request.contexts[0]
            ?.rootRiskId,
        ).toBe(
          request.rootRisks[0]
            ?.id,
        );

        expect(
          request.generatedAt,
        ).toBeTruthy();
      },
    );
  },
);

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildKiroDeepReviewPrompt,
} from "@/ai/kiro-review-contract";

describe(
  "Kiro deep review contract",
  () => {
    it(
      "explicitly forbids invented findings",
      () => {
        const prompt =
          buildKiroDeepReviewPrompt(
            {
              repository: {
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
              frameworks: [
                "gdpr",
              ],
              posture: {
                score: 100,
                frameworks: [],
                methodology:
                  "test",
                disclaimer:
                  "test",
              },
              findings: [],
              rootRisks: [],
              contexts: [],
            },
          );

        expect(
          prompt,
        ).toContain(
          "Do not invent source code.",
        );

        expect(
          prompt,
        ).toContain(
          "A false positive should be explicitly rejected.",
        );
      },
    );
  },
);

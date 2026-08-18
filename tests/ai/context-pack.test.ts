import {
  resolve,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createDeepReviewRequest,
} from "@/ai/context-pack";
import {
  profileRepository,
} from "@/intelligence/repository-profiler";
import {
  scanProject,
} from "@/scanner/core/scanner";
import {
  getRulesForFrameworks,
} from "@/scanner/core/rule-selector";
import {
  calculateEngineeringPosture,
} from "@/scanner/scoring/posture-score";

describe(
  "deep review context pack",
  () => {
    it(
      "packages only real scanner findings and source context",
      () => {
        const projectPath =
          resolve(
            process.cwd(),
            "demo/vulnerable-app",
          );

        const frameworks =
          [
            "gdpr",
            "soc2",
            "iso27001",
          ] as const;

        const result =
          scanProject(
            projectPath,
            getRulesForFrameworks(
              [...frameworks],
            ),
          );

        const repository =
          profileRepository(
            projectPath,
          );

        const posture =
          calculateEngineeringPosture(
            result.findings,
            [...frameworks],
          );

        const request =
          createDeepReviewRequest(
            {
              projectPath,
              repository,
              frameworks:
                [...frameworks],
              posture,
              findings:
                result.findings,
            },
          );

        expect(
          request.findings.length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          request.contexts.length,
        ).toBeGreaterThan(
          0,
        );

        expect(
          request.contexts[0]
            .content,
        ).toContain(":");
      },
    );
  },
);

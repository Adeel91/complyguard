import {
  resolve,
} from "node:path";

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  profileRepository,
} from "@/intelligence/repository-profiler";

describe(
  "repository profiler",
  () => {
    it(
      "builds intelligence from a real project",
      () => {
        const profile =
          profileRepository(
            resolve(
              process.cwd(),
              "demo/vulnerable-app",
            ),
          );

        expect(
          profile.primaryLanguage,
        ).toBe(
          "typescript",
        );

        expect(
          profile.sourceFileCount,
        ).toBeGreaterThan(
          0,
        );

        expect(
          profile.technologies.map(
            (technology) =>
              technology.name,
          ),
        ).toEqual(
          expect.arrayContaining([
            "Express",
            "JWT",
            "PostgreSQL",
            "Stripe",
          ]),
        );

        expect(
          profile.riskSurfaces.map(
            (surface) =>
              surface.id,
          ),
        ).toEqual(
          expect.arrayContaining([
            "authentication",
            "database",
            "payments",
          ]),
        );
      },
    );
  },
);

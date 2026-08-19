import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";

import {
  join,
} from "node:path";

import {
  tmpdir,
} from "node:os";

import {
  afterEach,
  describe,
  expect,
  it,
} from "vitest";

import {
  buildDeepReviewContexts,
} from "@/ai/context-pack";

import type {
  RootRisk,
} from "@/scanner/correlation/types";

const temporaryRoots:
  string[] = [];

function createProject(): string {
  const root =
    mkdtempSync(
      join(
        tmpdir(),
        "complyguard-context-",
      ),
    );

  temporaryRoots.push(
    root,
  );

  mkdirSync(
    join(
      root,
      "src",
    ),
    {
      recursive: true,
    },
  );

  writeFileSync(
    join(
      root,
      "src",
      "auth.ts",
    ),
    [
      'import crypto from "node:crypto";',
      "",
      "export function createToken() {",
      '  const prefix = "session";',
      "  const value = Math.random();",
      "  return `${prefix}-${value}`;",
      "}",
      "",
      "export function verifyToken(token: string) {",
      "  return token.length > 0;",
      "}",
    ].join(
      "\n",
    ),
    "utf8",
  );

  return root;
}

function createRisk(): RootRisk {
  return {
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
        "const value = Math.random();",
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

      {
        framework:
          "soc2",

        control:
          "CC6",

        ruleIds: [
          "SOC2-AUTH-001",
        ],
      },
    ],

    rawFindings: [],

    signalCount:
      2,
  };
}

afterEach(
  () => {
    for (
      const root of
      temporaryRoots.splice(
        0,
      )
    ) {
      rmSync(
        root,
        {
          recursive: true,
          force: true,
        },
      );
    }
  },
);

describe(
  "buildDeepReviewContexts",
  () => {
    it(
      "builds source context tied to the supplied root risk",
      () => {
        const root =
          createProject();

        const contexts =
          buildDeepReviewContexts(
            root,
            [
              createRisk(),
            ],
            {
              radius: 2,
            },
          );

        expect(
          contexts,
        ).toHaveLength(
          1,
        );

        expect(
          contexts[0]
            ?.rootRiskId,
        ).toBe(
          "risk-authentication",
        );

        expect(
          contexts[0]
            ?.file,
        ).toBe(
          "src/auth.ts",
        );

        expect(
          contexts[0]
            ?.startLine,
        ).toBe(
          3,
        );

        expect(
          contexts[0]
            ?.endLine,
        ).toBe(
          7,
        );

        expect(
          contexts[0]
            ?.content,
        ).toContain(
          "5 |   const value = Math.random();",
        );
      },
    );

    it(
      "limits the number of root risks included in the context pack",
      () => {
        const root =
          createProject();

        const first =
          createRisk();

        const second: RootRisk =
          {
            ...createRisk(),

            id:
              "risk-authentication-second",
          };

        const contexts =
          buildDeepReviewContexts(
            root,
            [
              first,
              second,
            ],
            {
              maxRisks: 1,
            },
          );

        expect(
          contexts,
        ).toHaveLength(
          1,
        );

        expect(
          contexts[0]
            ?.rootRiskId,
        ).toBe(
          first.id,
        );
      },
    );

    it(
      "does not read a source path outside the project root",
      () => {
        const root =
          createProject();

        const risk: RootRisk =
          {
            ...createRisk(),

            evidence: {
              ...createRisk()
                .evidence,

              file:
                "../outside.ts",
            },
          };

        expect(
          () =>
            buildDeepReviewContexts(
              root,
              [
                risk,
              ],
            ),
        ).toThrow(
          /outside project root/i,
        );
      },
    );
  },
);

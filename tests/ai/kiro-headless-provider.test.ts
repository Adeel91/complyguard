import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildKiroHeadlessArgs,
  normalizeKiroHeadlessOutput,
} from "@/ai/kiro-headless-provider";

describe(
  "buildKiroHeadlessArgs",
  () => {
    it(
      "uses non-interactive Kiro with the ComplyGuard agent",
      () => {
        const args =
          buildKiroHeadlessArgs(
            "review this evidence",
          );

        expect(
          args,
        ).toContain(
          "chat",
        );

        expect(
          args,
        ).toContain(
          "--no-interactive",
        );

        expect(
          args,
        ).toContain(
          "--agent",
        );

        expect(
          args,
        ).toContain(
          "complyguard-deep-review",
        );

        expect(
          args,
        ).toContain(
          "--trust-tools=read",
        );

        expect(
          args.at(
            -1,
          ),
        ).toBe(
          "review this evidence",
        );
      },
    );

    it(
      "does not grant write or unrestricted tool access",
      () => {
        const args =
          buildKiroHeadlessArgs(
            "review",
          );

        expect(
          args,
        ).not.toContain(
          "--trust-all-tools",
        );

        expect(
          args.join(
            " ",
          ),
        ).not.toContain(
          "write",
        );

        expect(
          args.join(
            " ",
          ),
        ).not.toContain(
          "shell",
        );
      },
    );
  },
);

describe(
  "normalizeKiroHeadlessOutput",
  () => {
    it(
      "trims clean model output",
      () => {
        expect(
          normalizeKiroHeadlessOutput(
            '  {"reviews":[]}  \n',
          ),
        ).toBe(
          '{"reviews":[]}',
        );
      },
    );

    it(
      "removes terminal ANSI sequences",
      () => {
        expect(
          normalizeKiroHeadlessOutput(
            "\u001b[32mhello\u001b[0m",
          ),
        ).toBe(
          "hello",
        );
      },
    );
  },
);

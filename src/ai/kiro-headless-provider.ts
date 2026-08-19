import {
  spawn,
} from "node:child_process";

import {
  writeFileSync,
} from "node:fs";

import {
  tmpdir,
} from "node:os";

import {
  join,
  resolve,
} from "node:path";

import {
  buildKiroDeepReviewPrompt,
} from "@/ai/kiro-review-contract";

import {
  parseDeepReviewResponse,
} from "@/ai/deep-review-schema";

import type {
  ComplianceIntelligenceProvider,
  DeepReviewRequest,
  DeepReviewResult,
} from "@/ai/types";

export type KiroHeadlessProviderOptions = {
  complyGuardRoot: string;

  projectRoot: string;

  agentName?: string;

  executable?: string;

  timeoutMs?: number;

  trustTools?: string[];
};

export class KiroHeadlessError
  extends Error {
  readonly exitCode:
    number | null;

  constructor(
    message: string,
    exitCode:
      number | null =
        null,
  ) {
    super(message);

    this.name =
      "KiroHeadlessError";

    this.exitCode =
      exitCode;
  }
}

function stripAnsi(
  value: string,
): string {
  return value.replace(
    /\u001B\[[0-?]*[ -/]*[@-~]/g,
    "",
  );
}

export function normalizeKiroHeadlessOutput(
  value: string,
): string {
  return stripAnsi(
    value,
  ).trim();
}

export function buildKiroHeadlessArgs(
  prompt: string,
  agentName =
    "complyguard-deep-review",
  trustTools: string[] = [
    "read",
  ],
): string[] {
  const args = [
    "chat",
    "--no-interactive",
    "--agent",
    agentName,
  ];

  if (
    trustTools.length >
    0
  ) {
    args.push(
      `--trust-tools=${trustTools.join(",")}`,
    );
  }

  args.push(
    prompt,
  );

  return args;
}

type CommandResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

function executeKiro(
  executable: string,
  args: string[],
  cwd: string,
  timeoutMs: number,
): Promise<CommandResult> {
  return new Promise(
    (
      resolvePromise,
      rejectPromise,
    ) => {
      const child =
        spawn(
          executable,
          args,
          {
            cwd,

            env:
              process.env,

            stdio: [
              "ignore",
              "pipe",
              "pipe",
            ],
          },
        );

      let stdout = "";
      let stderr = "";
      let settled =
        false;

      const timeout =
        setTimeout(
          () => {
            if (
              settled
            ) {
              return;
            }

            settled = true;

            child.kill(
              "SIGTERM",
            );

            rejectPromise(
              new KiroHeadlessError(
                `Kiro Deep Review timed out after ${timeoutMs} ms.`,
              ),
            );
          },
          timeoutMs,
        );

      child.stdout.on(
        "data",
        (
          chunk:
            Buffer,
        ) => {
          stdout +=
            chunk.toString(
              "utf8",
            );
        },
      );

      child.stderr.on(
        "data",
        (
          chunk:
            Buffer,
        ) => {
          stderr +=
            chunk.toString(
              "utf8",
            );
        },
      );

      child.on(
        "error",
        (
          error,
        ) => {
          if (
            settled
          ) {
            return;
          }

          settled = true;

          clearTimeout(
            timeout,
          );

          rejectPromise(
            new KiroHeadlessError(
              `Unable to start Kiro CLI: ${error.message}`,
            ),
          );
        },
      );

      child.on(
        "close",
        (
          code,
        ) => {
          if (
            settled
          ) {
            return;
          }

          settled = true;

          clearTimeout(
            timeout,
          );

          resolvePromise({
            stdout,

            stderr,

            exitCode:
              code ?? 1,
          });
        },
      );
    },
  );
}

export class KiroHeadlessProvider
  implements ComplianceIntelligenceProvider {
  readonly name =
    "kiro-headless";

  private readonly options:
    Required<KiroHeadlessProviderOptions>;

  constructor(
    options:
      KiroHeadlessProviderOptions,
  ) {
    this.options = {
      complyGuardRoot:
        resolve(
          options
            .complyGuardRoot,
        ),

      projectRoot:
        resolve(
          options
            .projectRoot,
        ),

      agentName:
        options
          .agentName ??
        "complyguard-deep-review",

      executable:
        options
          .executable ??
        "kiro-cli",

      timeoutMs:
        options
          .timeoutMs ??
        300_000,

      trustTools:
        options
          .trustTools ??
        [
          "read",
        ],
    };
  }

  async review(
    input:
      DeepReviewRequest,
  ): Promise<DeepReviewResult> {
    if (
      input.rootRisks
        .length ===
      0
    ) {
      return {
        provider:
          this.name,

        reviewedAt:
          new Date()
            .toISOString(),

        executiveSummary:
          "No correlated root risks were supplied for contextual review.",

        reviews: [],
      };
    }

    const contract =
      buildKiroDeepReviewPrompt(
        input,
      );

    /*
     * The ComplyGuard agent is loaded from the ComplyGuard workspace,
     * while the repository under review may live elsewhere.
     *
     * The deterministic source contexts are already embedded in the
     * contract. The absolute review root is supplied only so Kiro may
     * perform additional read-only inspection if the evidence warrants it.
     */
    const prompt = `
LOCAL REPOSITORY REVIEW ROOT

${this.options.projectRoot}

All source paths contained in the deterministic ComplyGuard evidence are
relative to this repository root.

You may use the read tool only when additional repository context is required.
Do not write files. Do not execute commands. Do not inspect unrelated code.

${contract}
`.trim();

    const args =
      buildKiroHeadlessArgs(
        prompt,
        this.options
          .agentName,
        this.options
          .trustTools,
      );

    const execution =
      await executeKiro(
        this.options
          .executable,

        args,

        this.options
          .complyGuardRoot,

        this.options
          .timeoutMs,
      );

    if (
      execution.exitCode !==
      0
    ) {
      throw new KiroHeadlessError(
        [
          `Kiro Deep Review failed with exit code ${execution.exitCode}.`,
          normalizeKiroHeadlessOutput(
            execution.stderr,
          ),
        ]
          .filter(
            Boolean,
          )
          .join(
            "\n",
          ),
        execution.exitCode,
      );
    }

    const raw =
      normalizeKiroHeadlessOutput(
        execution.stdout,
      );

    if (
      raw.length ===
      0
    ) {
      throw new KiroHeadlessError(
        [
          "Kiro Deep Review completed without returning review text.",
          normalizeKiroHeadlessOutput(
            execution.stderr,
          ),
        ]
          .filter(
            Boolean,
          )
          .join(
            "\n",
          ),
      );
    }

    writeFileSync(
      join(
        tmpdir(),
        "complyguard-kiro-last-raw.txt",
      ),
      `${raw}\n`,
      "utf8",
    );

    return parseDeepReviewResponse(
      raw,
      input,
      this.name,
    );
  }
}

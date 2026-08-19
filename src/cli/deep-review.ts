import {
  existsSync,
  writeFileSync,
} from "node:fs";

import {
  resolve,
} from "node:path";

import {
  Command,
} from "commander";

import {
  executeDeepReview,
  prepareDeepReview,
} from "@/ai/deep-review-runner";

import {
  buildKiroDeepReviewPrompt,
} from "@/ai/kiro-review-contract";

import {
  KiroHeadlessProvider,
} from "@/ai/kiro-headless-provider";

import type {
  ComplianceFramework,
} from "@/scanner/types/finding";

const validFrameworks =
  new Set<ComplianceFramework>([
    "gdpr",
    "soc2",
    "iso27001",
  ]);

function parseFrameworks(
  value: string,
): ComplianceFramework[] {
  const frameworks =
    value
      .split(",")
      .map(
        (item) =>
          item
            .trim()
            .toLowerCase(),
      )
      .filter(Boolean);

  const invalid =
    frameworks.filter(
      (framework) =>
        !validFrameworks.has(
          framework as
            ComplianceFramework,
        ),
    );

  if (invalid.length > 0) {
    throw new Error(
      `Unknown framework: ${invalid.join(", ")}`,
    );
  }

  if (
    frameworks.length ===
    0
  ) {
    throw new Error(
      "Select at least one framework.",
    );
  }

  return frameworks as
    ComplianceFramework[];
}

function parseMaxRisks(
  value: string,
): number {
  const parsed =
    Number.parseInt(
      value,
      10,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    parsed < 1 ||
    parsed > 20
  ) {
    throw new Error(
      "--max-risks must be between 1 and 20.",
    );
  }

  return parsed;
}

type CliOptions = {
  frameworks: string;
  maxRisks: string;
  repository?: string;
  output?: string;
  promptOnly?: boolean;
};

const program =
  new Command();

program
  .name(
    "complyguard-deep-review",
  )
  .description(
    "Deterministic ComplyGuard analysis followed by contextual Kiro Deep Review.",
  )
  .argument(
    "<project>",
    "Local TypeScript or JavaScript project directory.",
  )
  .option(
    "--frameworks <frameworks>",
    "Comma separated frameworks.",
    "gdpr,soc2,iso27001",
  )
  .option(
    "--max-risks <count>",
    "Maximum correlated root risks sent to Kiro.",
    "8",
  )
  .option(
    "--repository <name>",
    "Repository label shown in the review.",
  )
  .option(
    "--output <file>",
    "Write result to a file.",
  )
  .option(
    "--prompt-only",
    "Build the exact review prompt without calling Kiro.",
  )
  .action(
    async (
      project: string,
      options: CliOptions,
    ) => {
      const complyGuardRoot =
        process.cwd();

      const projectRoot =
        resolve(
          project,
        );

      if (
        !existsSync(
          projectRoot,
        )
      ) {
        throw new Error(
          `Project does not exist: ${projectRoot}`,
        );
      }

      const frameworks =
        parseFrameworks(
          options.frameworks,
        );

      const maxRisks =
        parseMaxRisks(
          options.maxRisks,
        );

      console.error(
        "Preparing deterministic ComplyGuard evidence...",
      );

      const prepared =
        prepareDeepReview({
          projectRoot,

          repository:
            options.repository,

          frameworks,

          maxRisks,
        });

      console.error(
        [
          `Source files: ${prepared.scan.sourceFileCount}`,
          `Raw findings: ${prepared.scan.findings.length}`,
          `Root risks: ${prepared.rootRisks.length}`,
          `Review set: ${prepared.reviewedRootRisks.length}`,
        ].join(
          " | ",
        ),
      );

      if (
        options.promptOnly
      ) {
        const prompt =
          buildKiroDeepReviewPrompt(
            prepared.request,
          );

        if (
          options.output
        ) {
          const outputPath =
            resolve(
              options.output,
            );

          writeFileSync(
            outputPath,
            prompt,
            "utf8",
          );

          console.error(
            `Prompt written to ${outputPath}`,
          );
        } else {
          process.stdout.write(
            `${prompt}\n`,
          );
        }

        return;
      }

      if (
        prepared.reviewedRootRisks
          .length === 0
      ) {
        const output =
          JSON.stringify(
            {
              repository:
                prepared
                  .request
                  .repository,

              sourceFileCount:
                prepared
                  .scan
                  .sourceFileCount,

              rawFindingCount:
                prepared
                  .scan
                  .findings
                  .length,

              rootRiskCount:
                0,

              review:
                null,

              message:
                "No correlated root risks were available for contextual review.",
            },
            null,
            2,
          );

        if (
          options.output
        ) {
          writeFileSync(
            resolve(
              options.output,
            ),
            `${output}\n`,
            "utf8",
          );
        } else {
          process.stdout.write(
            `${output}\n`,
          );
        }

        return;
      }

      console.error(
        "Starting REAL Kiro Deep Review...",
      );

      const provider =
        new KiroHeadlessProvider({
          complyGuardRoot,

          projectRoot,

          trustTools: [
            "read",
          ],
        });

      const executed =
        await executeDeepReview(
          prepared,
          provider,
        );

      const output =
        JSON.stringify(
          {
            repository:
              prepared
                .request
                .repository,

            generatedAt:
              prepared
                .request
                .generatedAt,

            sourceFileCount:
              prepared
                .scan
                .sourceFileCount,

            ruleCount:
              prepared
                .scan
                .ruleCount,

            rawFindingCount:
              prepared
                .scan
                .findings
                .length,

            rootRiskCount:
              prepared
                .rootRisks
                .length,

            reviewedRootRiskCount:
              prepared
                .reviewedRootRisks
                .length,

            posture:
              prepared
                .posture,

            reviewedRootRisks:
              prepared
                .reviewedRootRisks,

            review:
              executed.review,
          },
          null,
          2,
        );

      if (
        options.output
      ) {
        const outputPath =
          resolve(
            options.output,
          );

        writeFileSync(
          outputPath,
          `${output}\n`,
          "utf8",
        );

        console.error(
          `Deep Review written to ${outputPath}`,
        );
      } else {
        process.stdout.write(
          `${output}\n`,
        );
      }
    },
  );

program
  .parseAsync(
    process.argv,
  )
  .catch(
    (error: unknown) => {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown Deep Review failure.";

      console.error();
      console.error(
        "Deep Review failed:",
      );

      console.error(
        message,
      );

      console.error();

      console.error(
        "If authentication is required, run kiro-cli interactively, sign in, and retry.",
      );

      process.exitCode = 1;
    },
  );

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
  correlateFindings,
} from "@/scanner/correlation/correlation";

import {
  getRulesForFrameworks,
} from "@/scanner/core/rule-selector";

import {
  scanProject,
} from "@/scanner/core/scanner";

import type {
  ComplianceFramework,
} from "@/scanner/types/finding";

import {
  verifyRemediation,
} from "@/verification/remediation-verifier";

const supportedFrameworks =
  new Set<
    ComplianceFramework
  >([
    "gdpr",
    "soc2",
    "iso27001",
  ]);

function parseFrameworks(
  input: string,
): ComplianceFramework[] {
  const frameworks =
    input
      .split(",")
      .map(
        (
          value,
        ) =>
          value
            .trim()
            .toLowerCase(),
      )
      .filter(
        Boolean,
      );

  const invalid =
    frameworks.filter(
      (
        framework,
      ) =>
        !supportedFrameworks.has(
          framework as
            ComplianceFramework,
        ),
    );

  if (
    invalid.length >
    0
  ) {
    throw new Error(
      `Unsupported framework: ${invalid.join(", ")}`,
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

const program =
  new Command();

program
  .name(
    "complyguard-verify-remediation",
  )
  .description(
    "Deterministically compare scanner evidence before and after remediation.",
  )
  .argument(
    "<before>",
    "Project directory before remediation.",
  )
  .argument(
    "<after>",
    "Project directory after remediation.",
  )
  .option(
    "--frameworks <frameworks>",
    "Comma separated rule packs.",
    "gdpr,soc2,iso27001",
  )
  .option(
    "--output <file>",
    "Write the complete verification report as JSON.",
  )
  .action(
    (
      before: string,
      after: string,
      options: {
        frameworks:
          string;

        output?:
          string;
      },
    ) => {
      const beforeRoot =
        resolve(
          before,
        );

      const afterRoot =
        resolve(
          after,
        );

      if (
        !existsSync(
          beforeRoot,
        )
      ) {
        throw new Error(
          `Before project does not exist: ${beforeRoot}`,
        );
      }

      if (
        !existsSync(
          afterRoot,
        )
      ) {
        throw new Error(
          `After project does not exist: ${afterRoot}`,
        );
      }

      const frameworks =
        parseFrameworks(
          options.frameworks,
        );

      const rules =
        getRulesForFrameworks(
          frameworks,
        );

      console.error(
        "Scanning before state...",
      );

      const beforeScan =
        scanProject(
          beforeRoot,
          rules,
        );

      console.error(
        "Scanning after state...",
      );

      const afterScan =
        scanProject(
          afterRoot,
          rules,
        );

      const beforeRootRisks =
        correlateFindings(
          beforeScan.findings,
        );

      const afterRootRisks =
        correlateFindings(
          afterScan.findings,
        );

      const verification =
        verifyRemediation({
          beforeProjectRoot:
            beforeRoot,

          afterProjectRoot:
            afterRoot,

          beforeRootRisks,

          afterRootRisks,
        });

      const result = {
        generatedAt:
          new Date()
            .toISOString(),

        frameworks,

        before: {
          sourceFileCount:
            beforeScan
              .sourceFileCount,

          rawFindingCount:
            beforeScan
              .findings
              .length,

          rootRiskCount:
            beforeRootRisks
              .length,
        },

        after: {
          sourceFileCount:
            afterScan
              .sourceFileCount,

          rawFindingCount:
            afterScan
              .findings
              .length,

          rootRiskCount:
            afterRootRisks
              .length,
        },

        verification,
      };

      console.log();
      console.log(
        "==============================================================",
      );

      console.log(
        " COMPLYGUARD REMEDIATION VERIFICATION",
      );

      console.log(
        "==============================================================",
      );

      console.log();

      console.log(
        `Before: ${result.before.rawFindingCount} signals / ${result.before.rootRiskCount} root risks`,
      );

      console.log(
        `After:  ${result.after.rawFindingCount} signals / ${result.after.rootRiskCount} root risks`,
      );

      console.log();

      console.log(
        `Resolved:   ${verification.summary.resolved}`,
      );

      console.log(
        `Persisting: ${verification.summary.persisting}`,
      );

      console.log(
        `Introduced: ${verification.summary.introduced}`,
      );

      if (
        verification.resolved.length >
        0
      ) {
        console.log();
        console.log(
          "RESOLVED",
        );

        for (
          const risk of
          verification.resolved
        ) {
          console.log(
            `✓ ${risk.relativeFile}:${risk.line} · ${risk.family}`,
          );
        }
      }

      if (
        verification.persisting.length >
        0
      ) {
        console.log();
        console.log(
          "PERSISTING",
        );

        for (
          const risk of
          verification.persisting
        ) {
          console.log(
            `• ${risk.before.relativeFile}:${risk.before.line} · ${risk.before.family}`,
          );
        }
      }

      if (
        verification.introduced.length >
        0
      ) {
        console.log();
        console.log(
          "INTRODUCED",
        );

        for (
          const risk of
          verification.introduced
        ) {
          console.log(
            `! ${risk.relativeFile}:${risk.line} · ${risk.family}`,
          );
        }
      }

      console.log();
      console.log(
        verification.disclaimer,
      );

      if (
        options.output
      ) {
        const output =
          resolve(
            options.output,
          );

        writeFileSync(
          output,
          `${JSON.stringify(result, null, 2)}\n`,
          "utf8",
        );

        console.log();
        console.log(
          `Report written to ${output}`,
        );
      }
    },
  );

program
  .parseAsync(
    process.argv,
  )
  .catch(
    (
      error:
        unknown,
    ) => {
      console.error();

      console.error(
        error instanceof Error
          ? error.message
          : "Unknown remediation verification error.",
      );

      process.exitCode =
        1;
    },
  );

#!/usr/bin/env node

import { Command } from "commander";

import { scanProject } from "@/scanner/core/scanner";
import { createJsonReport } from "@/scanner/reporters/json-reporter";
import { complianceRules } from "@/scanner/rules";

const program = new Command();

program
  .name("complyguard")
  .description("Static compliance risk scanner for software projects")
  .version("0.1.0");

program
  .command("scan")
  .description("Scan a local TypeScript or JavaScript project")
  .argument("<path>", "Path to the project")
  .option("--json", "Output JSON")
  .action((path: string, options: { json?: boolean }) => {
    try {
      const result = scanProject(path, complianceRules);

      if (options.json) {
        console.log(createJsonReport(result));
        return;
      }

      console.log("");
      console.log("ComplyGuard");
      console.log("");
      console.log(`Project: ${result.projectPath}`);
      console.log(`Source files: ${result.sourceFileCount}`);
      console.log(`Active rules: ${result.ruleCount}`);
      console.log(`Findings: ${result.findings.length}`);
      console.log("");

      if (result.ruleCount === 0) {
        console.log(
          "Scanner infrastructure is ready. Compliance rules have not been implemented yet.",
        );
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown scanner error";

      console.error(message);
      process.exitCode = 1;
    }
  });

program.parse();

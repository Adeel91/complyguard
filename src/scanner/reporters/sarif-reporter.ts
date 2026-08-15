import { relative } from "node:path";

import type { ScanResult } from "@/scanner/core/scanner";
import type { FindingSeverity } from "@/scanner/types/finding";

function toSarifLevel(
  severity: FindingSeverity,
): "error" | "warning" | "note" {
  if (severity === "critical" || severity === "high") {
    return "error";
  }

  if (severity === "medium") {
    return "warning";
  }

  return "note";
}

export function createSarifReport(result: ScanResult) {
  return {
    version: "2.1.0",
    $schema:
      "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: "ComplyGuard",
          },
        },
        results: result.findings.map((finding) => ({
          ruleId: finding.ruleId,
          level: toSarifLevel(finding.severity),
          message: {
            text: finding.description,
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: relative(
                    result.projectPath,
                    finding.location.file,
                  ).replaceAll("\\", "/"),
                },
                region: {
                  startLine: finding.location.line,
                  startColumn: finding.location.column,
                },
              },
            },
          ],
          properties: {
            framework: finding.framework,
            control: finding.control,
            severity: finding.severity,
            evidence: finding.evidence,
            remediation: finding.remediation,
          },
        })),
      },
    ],
  };
}

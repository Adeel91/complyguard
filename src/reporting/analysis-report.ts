import type { RepositoryProfile } from "@/intelligence/types";
import type { EngineeringPosture } from "@/scanner/scoring/posture-score";
import type {
  ComplianceFinding,
  ComplianceFramework,
} from "@/scanner/types/finding";

export interface AnalysisReport {
  summary: {
    headline: string;
    description: string;
    sourceFileCount: number;
    ruleCount: number;
    findingCount: number;
    criticalCount: number;
    highCount: number;
  };
  posture: EngineeringPosture;
  repositoryProfile: RepositoryProfile;
  topFindings: ComplianceFinding[];
  frameworks: Array<{
    framework: ComplianceFramework;
    findings: number;
  }>;
}

const severityOrder = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
} as const;

export function createAnalysisReport(input: {
  sourceFileCount: number;
  ruleCount: number;
  findings: ComplianceFinding[];
  frameworks: ComplianceFramework[];
  posture: EngineeringPosture;
  repositoryProfile: RepositoryProfile;
}): AnalysisReport {
  const criticalCount =
    input.findings.filter(
      (finding) =>
        finding.severity ===
        "critical",
    ).length;

  const highCount =
    input.findings.filter(
      (finding) =>
        finding.severity ===
        "high",
    ).length;

  const topFindings = [
    ...input.findings,
  ]
    .sort(
      (left, right) =>
        severityOrder[
          right.severity
        ] -
        severityOrder[
          left.severity
        ],
    )
    .slice(0, 8);

  const headline =
    input.findings.length === 0
      ? "No mapped risks detected by the active rule set."
      : criticalCount > 0
        ? `${criticalCount} critical engineering risk${criticalCount === 1 ? "" : "s"} require attention.`
        : highCount > 0
          ? `${highCount} high severity engineering risk${highCount === 1 ? "" : "s"} detected.`
          : `${input.findings.length} mapped engineering risk${input.findings.length === 1 ? "" : "s"} detected.`;

  return {
    summary: {
      headline,
      description:
        `ComplyGuard analyzed ${input.sourceFileCount} source files with ${input.ruleCount} active deterministic rules and produced ${input.findings.length} evidence backed findings.`,
      sourceFileCount:
        input.sourceFileCount,
      ruleCount:
        input.ruleCount,
      findingCount:
        input.findings.length,
      criticalCount,
      highCount,
    },
    posture:
      input.posture,
    repositoryProfile:
      input.repositoryProfile,
    topFindings,
    frameworks:
      input.frameworks.map(
        (framework) => ({
          framework,
          findings:
            input.findings.filter(
              (finding) =>
                finding.framework ===
                framework,
            ).length,
        }),
      ),
  };
}

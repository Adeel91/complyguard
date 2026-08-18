import type {
  ComplianceFinding,
  ComplianceFramework,
  FindingSeverity,
} from "@/scanner/types/finding";

export interface FrameworkPosture {
  framework: ComplianceFramework;
  score: number;
  findingCount: number;
  weightedRisk: number;
  criticalCount: number;
  highCount: number;
}

export interface EngineeringPosture {
  score: number;
  frameworks: FrameworkPosture[];
  methodology: string;
  disclaimer: string;
}

const SEVERITY_WEIGHT: Record<
  FindingSeverity,
  number
> = {
  critical: 24,
  high: 14,
  medium: 7,
  low: 3,
  info: 1,
};

function clampScore(
  weightedRisk: number,
): number {
  return Math.max(
    0,
    Math.round(
      100 - weightedRisk,
    ),
  );
}

export function calculateEngineeringPosture(
  findings: ComplianceFinding[],
  frameworks: ComplianceFramework[],
): EngineeringPosture {
  const frameworkScores =
    frameworks.map((framework) => {
      const matching =
        findings.filter(
          (finding) =>
            finding.framework ===
            framework,
        );

      const weightedRisk =
        matching.reduce(
          (total, finding) =>
            total +
            SEVERITY_WEIGHT[
              finding.severity
            ],
          0,
        );

      return {
        framework,
        score:
          clampScore(
            weightedRisk,
          ),
        findingCount:
          matching.length,
        weightedRisk,
        criticalCount:
          matching.filter(
            (finding) =>
              finding.severity ===
              "critical",
          ).length,
        highCount:
          matching.filter(
            (finding) =>
              finding.severity ===
              "high",
          ).length,
      };
    });

  const score =
    frameworkScores.length === 0
      ? 0
      : Math.round(
          frameworkScores.reduce(
            (total, framework) =>
              total +
              framework.score,
            0,
          ) /
            frameworkScores.length,
        );

  return {
    score,
    frameworks:
      frameworkScores,
    methodology:
      "Observed engineering posture starts at 100 and subtracts deterministic weights for findings produced by the executed ComplyGuard rules.",
    disclaimer:
      "This score measures only observed engineering risk from the executed rules. It is not a compliance certification, audit opinion, or proof of regulatory readiness.",
  };
}

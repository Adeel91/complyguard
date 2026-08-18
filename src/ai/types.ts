import type { RepositoryProfile } from "@/intelligence/types";
import type { RootRisk } from "@/scanner/correlation";
import type { EngineeringPosture } from "@/scanner/scoring/posture-score";
import type {
  ComplianceFinding,
  ComplianceFramework,
} from "@/scanner/types/finding";

export type DeepReviewVerdict =
  | "confirmed"
  | "likely"
  | "false-positive"
  | "needs-review";

export interface SourceContext {
  file: string;
  startLine: number;
  endLine: number;
  content: string;
}

export interface DeepReviewFinding {
  ruleId: string;
  verdict: DeepReviewVerdict;
  confidence: number;
  reasoning: string;
  businessImpact: string;
  remediationPlan: string[];
  suggestedPatch?: string;
}

export interface DeepReviewRequest {
  repository: RepositoryProfile;
  frameworks: ComplianceFramework[];
  posture: EngineeringPosture;
  findings: ComplianceFinding[];
  rootRisks: RootRisk[];
  contexts: SourceContext[];
}

export interface DeepReviewResult {
  provider: string;
  reviewedAt: string;
  findings: DeepReviewFinding[];
  executiveSummary: string;
}

export interface ComplianceIntelligenceProvider {
  readonly name: string;

  review(
    input: DeepReviewRequest,
  ): Promise<DeepReviewResult>;
}

import type {
  RepositoryProfile,
} from "@/intelligence/types";

import type {
  RootRisk,
} from "@/scanner/correlation/types";

import type {
  EngineeringPosture,
} from "@/scanner/scoring/posture-score";

import type {
  ComplianceFramework,
} from "@/scanner/types/finding";

export type DeepReviewVerdict =
  | "confirmed"
  | "likely"
  | "false-positive"
  | "needs-review";

export type EvidenceAdequacy =
  | "sufficient"
  | "partial"
  | "insufficient";

export type DeepReviewSourceContext = {
  rootRiskId: string;

  file: string;

  startLine: number;

  endLine: number;

  content: string;
};

export type DeepReviewRequest = {
  repository: string;

  generatedAt: string;

  frameworks:
    ComplianceFramework[];

  repositoryProfile:
    RepositoryProfile;

  posture:
    EngineeringPosture;

  rootRisks:
    RootRisk[];

  contexts:
    DeepReviewSourceContext[];
};

export type SuggestedPatch = {
  file: string;

  rationale?: string;

  diff: string;
};

export type DeepReviewRisk = {
  rootRiskId: string;

  verdict:
    DeepReviewVerdict;

  confidence: number;

  evidenceAdequacy:
    EvidenceAdequacy;

  reasoning: string;

  businessImpact: string;

  remediationPlan:
    string[];

  suggestedPatch:
    SuggestedPatch | null;
};

export type DeepReviewResult = {
  provider: string;

  reviewedAt: string;

  executiveSummary: string;

  reviews:
    DeepReviewRisk[];
};

export interface ComplianceIntelligenceProvider {
  readonly name: string;

  review(
    input: DeepReviewRequest,
  ): Promise<DeepReviewResult>;
}

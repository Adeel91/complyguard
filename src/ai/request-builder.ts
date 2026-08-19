import type {
  DeepReviewRequest,
  DeepReviewSourceContext,
} from "@/ai/types";

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

export type BuildDeepReviewRequestInput = {
  repository: string;

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

export function buildDeepReviewRequest(
  input: BuildDeepReviewRequestInput,
): DeepReviewRequest {
  return {
    repository:
      input.repository,

    generatedAt:
      new Date()
        .toISOString(),

    frameworks:
      input.frameworks,

    repositoryProfile:
      input.repositoryProfile,

    posture:
      input.posture,

    rootRisks:
      input.rootRisks,

    contexts:
      input.contexts,
  };
}

import type {
  ComplianceIntelligenceProvider,
  DeepReviewRequest,
  DeepReviewResult,
} from "@/ai/types";

export class IntelligenceUnavailableError extends Error {
  constructor() {
    super(
      "Deep Review is not configured. Deterministic scanning remains available.",
    );

    this.name =
      "IntelligenceUnavailableError";
  }
}

export class UnconfiguredIntelligenceProvider
  implements ComplianceIntelligenceProvider
{
  readonly name =
    "unconfigured";

  async review(
    input: DeepReviewRequest,
  ): Promise<DeepReviewResult> {
    void input;
    throw new IntelligenceUnavailableError();
  }
}

import type {
  ComplianceIntelligenceProvider,
  DeepReviewRequest,
  DeepReviewResult,
} from "@/ai/types";

export class IntelligenceUnavailableError
  extends Error {
  constructor(
    message =
      "Deep Review provider is not configured.",
  ) {
    super(message);

    this.name =
      "IntelligenceUnavailableError";
  }
}

export class UnconfiguredIntelligenceProvider
  implements ComplianceIntelligenceProvider {
  readonly name =
    "unconfigured";

  async review(
    input: DeepReviewRequest,
  ): Promise<DeepReviewResult> {
    void input;

    throw new IntelligenceUnavailableError();
  }
}

export function createUnconfiguredIntelligenceProvider(): ComplianceIntelligenceProvider {
  return new UnconfiguredIntelligenceProvider();
}

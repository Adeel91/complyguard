import {
  z,
} from "zod";

import type {
  DeepReviewRequest,
  DeepReviewResult,
} from "@/ai/types";

export const deepReviewVerdictSchema =
  z.enum([
    "confirmed",
    "likely",
    "false-positive",
    "needs-review",
  ]);

export const evidenceAdequacySchema =
  z.enum([
    "sufficient",
    "partial",
    "insufficient",
  ]);

const suggestedPatchSchema =
  z
    .object({
      file:
        z
          .string()
          .min(1),

      rationale:
        z
          .string()
          .min(1)
          .optional(),

      diff:
        z
          .string()
          .min(1),
    })
    .strict();

export const deepReviewRiskSchema =
  z
    .object({
      rootRiskId:
        z
          .string()
          .min(1),

      verdict:
        deepReviewVerdictSchema,

      confidence:
        z
          .number()
          .min(0)
          .max(1),

      evidenceAdequacy:
        evidenceAdequacySchema,

      reasoning:
        z
          .string()
          .min(1),

      businessImpact:
        z
          .string()
          .min(1),

      remediationPlan:
        z
          .array(
            z
              .string()
              .min(1),
          )
          .min(1)
          .max(8),

      suggestedPatch:
        suggestedPatchSchema
          .nullable()
          .optional()
          .transform(
            (value) =>
              value ?? null,
          ),
    })
    .strict();

export const deepReviewModelResponseSchema =
  z
    .object({
      executiveSummary:
        z
          .string()
          .min(1),

      reviews:
        z
          .array(
            deepReviewRiskSchema,
          ),
    })
    .strict();

export type DeepReviewModelResponse =
  z.infer<
    typeof deepReviewModelResponseSchema
  >;

export class DeepReviewValidationError
  extends Error {
  constructor(
    message: string,
  ) {
    super(message);

    this.name =
      "DeepReviewValidationError";
  }
}

function extractJson(
  raw: string,
): string {
  const trimmed =
    raw.trim();

  if (
    trimmed.length ===
    0
  ) {
    throw new DeepReviewValidationError(
      "Deep Review returned an empty response.",
    );
  }

  const fenced =
    trimmed.match(
      /```(?:json)?\s*([\s\S]*?)```/i,
    );

  if (
    fenced?.[1]
  ) {
    return fenced[1].trim();
  }

  const firstBrace =
    trimmed.indexOf(
      "{",
    );

  const lastBrace =
    trimmed.lastIndexOf(
      "}",
    );

  if (
    firstBrace === -1 ||
    lastBrace === -1 ||
    lastBrace <
      firstBrace
  ) {
    throw new DeepReviewValidationError(
      "Deep Review did not return a JSON object.",
    );
  }

  return trimmed.slice(
    firstBrace,
    lastBrace + 1,
  );
}

function parseJson(
  raw: string,
): unknown {
  const json =
    extractJson(
      raw,
    );

  try {
    return JSON.parse(
      json,
    ) as unknown;
  } catch (
    error
  ) {
    const reason =
      error instanceof Error
        ? error.message
        : "Unknown JSON parsing error.";

    throw new DeepReviewValidationError(
      `Deep Review returned invalid JSON: ${reason}`,
    );
  }
}

function validateCoverage(
  input: DeepReviewRequest,
  parsed: DeepReviewModelResponse,
): void {
  const expectedIds =
    new Set(
      input.rootRisks.map(
        (
          risk,
        ) => risk.id,
      ),
    );

  const returnedIds =
    parsed.reviews.map(
      (
        review,
      ) =>
        review.rootRiskId,
    );

  const uniqueReturnedIds =
    new Set(
      returnedIds,
    );

  if (
    uniqueReturnedIds.size !==
    returnedIds.length
  ) {
    throw new DeepReviewValidationError(
      "Deep Review returned duplicate root risk reviews.",
    );
  }

  const unknownIds =
    returnedIds.filter(
      (
        id,
      ) =>
        !expectedIds.has(
          id,
        ),
    );

  if (
    unknownIds.length >
    0
  ) {
    throw new DeepReviewValidationError(
      `Deep Review invented unknown root risk IDs: ${unknownIds.join(", ")}`,
    );
  }

  const missingIds =
    [
      ...expectedIds,
    ].filter(
      (
        id,
      ) =>
        !uniqueReturnedIds.has(
          id,
        ),
    );

  if (
    missingIds.length >
    0
  ) {
    throw new DeepReviewValidationError(
      `Deep Review did not review every supplied root risk. Missing: ${missingIds.join(", ")}`,
    );
  }

  if (
    parsed.reviews.length !==
    input.rootRisks.length
  ) {
    throw new DeepReviewValidationError(
      "Deep Review response count does not match the supplied root risk count.",
    );
  }
}

export function parseDeepReviewResponse(
  raw: string,
  input: DeepReviewRequest,
  provider = "kiro",
): DeepReviewResult {
  const json =
    parseJson(
      raw,
    );

  const validation =
    deepReviewModelResponseSchema.safeParse(
      json,
    );

  if (
    !validation.success
  ) {
    throw new DeepReviewValidationError(
      `Deep Review response failed schema validation: ${validation.error.message}`,
    );
  }

  validateCoverage(
    input,
    validation.data,
  );

  return {
    provider,

    reviewedAt:
      new Date()
        .toISOString(),

    executiveSummary:
      validation.data
        .executiveSummary,

    reviews:
      validation.data
        .reviews,
  };
}

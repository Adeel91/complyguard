import { NextResponse } from "next/server";
import { z } from "zod";

import type { ComplianceFramework } from "@/scanner/types/finding";
import {
  KiroWorkerError,
  requestKiroWorker,
} from "@/server/kiro-worker-client";
import {
  isDeepReviewAuthorized,
} from "@/server/kiro-runtime";

export const runtime = "nodejs";
export const maxDuration = 300;

const requestSchema = z.object({
  repositoryUrl:
    z.string().url().max(500),

  frameworks:
    z
      .array(
        z.enum([
          "gdpr",
          "soc2",
          "iso27001",
        ]),
      )
      .min(1)
      .max(3),

  maxRisks:
    z
      .number()
      .int()
      .min(1)
      .max(8)
      .default(8),
});

function errorResponse(
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      error: message,
    },
    {
      status,

      headers: {
        "Cache-Control":
          "no-store",
      },
    },
  );
}

export async function POST(
  request: Request,
) {
  try {
    if (
      !process.env
        .COMPLYGUARD_DEEP_REVIEW_TOKEN
    ) {
      return errorResponse(
        "Hosted Kiro Deep Review is currently disabled.",
        503,
      );
    }

    const suppliedToken =
      request.headers.get(
        "x-complyguard-review-token",
      );

    if (
      !isDeepReviewAuthorized(
        suppliedToken,
      )
    ) {
      return errorResponse(
        "A valid Deep Review access code is required.",
        401,
      );
    }

    const body =
      requestSchema.parse(
        await request.json(),
      );

    const payload =
      await requestKiroWorker({
        repositoryUrl:
          body.repositoryUrl,

        frameworks:
          body.frameworks as
            ComplianceFramework[],

        maxRisks:
          body.maxRisks,
      });

    return NextResponse.json(
      payload,
      {
        headers: {
          "Cache-Control":
            "no-store",
        },
      },
    );
  } catch (error) {
    if (
      error instanceof
      z.ZodError
    ) {
      return errorResponse(
        "Invalid Deep Review request.",
        400,
      );
    }

    if (
      error instanceof
      KiroWorkerError
    ) {
      return errorResponse(
        error.message,
        error.status,
      );
    }

    console.error(
      "Unexpected Deep Review proxy error:",
      error,
    );

    return errorResponse(
      "An unexpected Deep Review error occurred.",
      500,
    );
  }
}

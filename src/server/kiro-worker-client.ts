import { z } from "zod";

import type { ComplianceFramework } from "@/scanner/types/finding";

export type KiroWorkerRequest = {
  repositoryUrl: string;
  frameworks: ComplianceFramework[];
  maxRisks: number;
};

export class KiroWorkerError extends Error {
  readonly status: number;

  constructor(
    message: string,
    status = 502,
  ) {
    super(message);

    this.name = "KiroWorkerError";
    this.status = status;
  }
}

const workerErrorSchema = z.object({
  error: z.string(),
});

export async function requestKiroWorker(
  input: KiroWorkerRequest,
): Promise<unknown> {
  const workerUrl =
    process.env.KIRO_WORKER_URL?.trim();

  const workerToken =
    process.env.KIRO_WORKER_TOKEN?.trim();

  if (!workerUrl || !workerToken) {
    throw new KiroWorkerError(
      "Hosted Kiro Deep Review is not configured.",
      503,
    );
  }

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      250_000,
    );

  try {
    const response =
      await fetch(
        new URL(
          "/deep-review",
          workerUrl,
        ),
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${workerToken}`,
          },

          body:
            JSON.stringify(input),

          cache:
            "no-store",

          signal:
            controller.signal,
        },
      );

    const payload: unknown =
      await response
        .json()
        .catch(() => null);

    if (!response.ok) {
      const parsed =
        workerErrorSchema.safeParse(
          payload,
        );

      throw new KiroWorkerError(
        parsed.success
          ? parsed.data.error
          : "The Kiro review worker could not complete the request.",
        response.status,
      );
    }

    return payload;
  } catch (error) {
    if (
      error instanceof
      KiroWorkerError
    ) {
      throw error;
    }

    if (
      error instanceof Error &&
      error.name ===
        "AbortError"
    ) {
      throw new KiroWorkerError(
        "Kiro Deep Review timed out.",
        504,
      );
    }

    throw new KiroWorkerError(
      "Unable to reach the Kiro review worker.",
      502,
    );
  } finally {
    clearTimeout(timeout);
  }
}

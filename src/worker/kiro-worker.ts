import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";

import { z } from "zod";

import {
  executeDeepReview,
  prepareDeepReview,
} from "@/ai/deep-review-runner";

import {
  KiroHeadlessError,
  KiroHeadlessProvider,
} from "@/ai/kiro-headless-provider";

import type {
  ComplianceFramework,
} from "@/scanner/types/finding";

import {
  downloadGitHubRepository,
  GitHubRepositoryError,
} from "@/server/github-repository";

import {
  isDeepReviewAuthorized,
  sanitizeRepositoryPaths,
} from "@/server/kiro-runtime";

const PORT =
  Number(
    process.env.PORT ??
      8787,
  );

const HOST =
  process.env.HOST ??
  "0.0.0.0";

const MAX_BODY_BYTES =
  16 * 1024;

const requestSchema =
  z.object({
    repositoryUrl:
      z
        .string()
        .url()
        .max(500),

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

let reviewRunning =
  false;

function json(
  response:
    ServerResponse,
  status:
    number,
  body:
    unknown,
) {
  const payload =
    JSON.stringify(
      body,
    );

  response.writeHead(
    status,
    {
      "Content-Type":
        "application/json; charset=utf-8",

      "Content-Length":
        Buffer.byteLength(
          payload,
        ),

      "Cache-Control":
        "no-store",
    },
  );

  response.end(
    payload,
  );
}

async function readJsonBody(
  request:
    IncomingMessage,
): Promise<unknown> {
  const chunks:
    Buffer[] = [];

  let bytes =
    0;

  for await (
    const chunk of
      request
  ) {
    const buffer =
      Buffer.isBuffer(
        chunk,
      )
        ? chunk
        : Buffer.from(
            chunk,
          );

    bytes +=
      buffer.length;

    if (
      bytes >
      MAX_BODY_BYTES
    ) {
      throw new Error(
        "REQUEST_TOO_LARGE",
      );
    }

    chunks.push(
      buffer,
    );
  }

  return JSON.parse(
    Buffer.concat(
      chunks,
    ).toString(
      "utf8",
    ),
  );
}

function repositoryError(
  error:
    GitHubRepositoryError,
): {
  status: number;
  message: string;
} {
  switch (
    error.code
  ) {
    case "invalid_url":
      return {
        status: 400,
        message:
          error.message,
      };

    case "rate_limited":
      return {
        status: 429,
        message:
          error.message,
      };

    case "not_found":
      return {
        status: 404,
        message:
          "Repository was not found or is not publicly accessible.",
      };

    case "too_large":
      return {
        status: 413,
        message:
          error.message,
      };

    case "download_failed":
    case "extract_failed":
      return {
        status: 502,
        message:
          "Unable to download or extract the repository.",
      };
  }
}

async function handleDeepReview(
  request:
    IncomingMessage,
  response:
    ServerResponse,
) {
  const expectedToken =
    process.env
      .KIRO_WORKER_TOKEN;

  if (
    !expectedToken
  ) {
    json(
      response,
      503,
      {
        error:
          "Kiro worker is not configured.",
      },
    );

    return;
  }

  const authorization =
    request.headers
      .authorization;

  const suppliedToken =
    authorization
      ?.startsWith(
        "Bearer ",
      )
      ? authorization.slice(
          7,
        )
      : null;

  if (
    !isDeepReviewAuthorized(
      suppliedToken,
      expectedToken,
    )
  ) {
    json(
      response,
      401,
      {
        error:
          "Unauthorized worker request.",
      },
    );

    return;
  }

  if (
    reviewRunning
  ) {
    json(
      response,
      429,
      {
        error:
          "A Kiro Deep Review is already running. Please try again shortly.",
      },
    );

    return;
  }

  let repository:
    | Awaited<
        ReturnType<
          typeof downloadGitHubRepository
        >
      >
    | undefined;

  reviewRunning =
    true;

  try {
    const body =
      requestSchema.parse(
        await readJsonBody(
          request,
        ),
      );

    repository =
      await downloadGitHubRepository(
        body.repositoryUrl,
      );

    const frameworks =
      body.frameworks as
        ComplianceFramework[];

    const prepared =
      prepareDeepReview({
        projectRoot:
          repository.rootPath,

        repository:
          `${repository.owner}/${repository.repository}`,

        frameworks,

        maxRisks:
          body.maxRisks,
      });

    const provider =
      new KiroHeadlessProvider({
        complyGuardRoot:
          process.cwd(),

        projectRoot:
          repository.rootPath,

        timeoutMs:
          240_000,

        trustTools: [
          "read",
        ],
      });

    const executed =
      await executeDeepReview(
        prepared,
        provider,
      );

    const payload =
      sanitizeRepositoryPaths(
        {
          repository: {
            owner:
              repository.owner,

            name:
              repository.repository,

            branch:
              repository.defaultBranch,

            url:
              body.repositoryUrl,
          },

          frameworks,

          deterministic: {
            sourceFileCount:
              executed
                .prepared
                .scan
                .sourceFileCount,

            ruleCount:
              executed
                .prepared
                .scan
                .ruleCount,

            rawFindingCount:
              executed
                .prepared
                .scan
                .findings
                .length,

            rootRiskCount:
              executed
                .prepared
                .rootRisks
                .length,

            reviewedRootRiskCount:
              executed
                .prepared
                .reviewedRootRisks
                .length,
          },

          posture:
            executed
              .prepared
              .posture,

          reviewedRootRisks:
            executed
              .prepared
              .reviewedRootRisks,

          review:
            executed.review,
        },

        repository.rootPath,
      );

    json(
      response,
      200,
      payload,
    );
  } catch (
    error
  ) {
    if (
      error instanceof
      z.ZodError
    ) {
      json(
        response,
        400,
        {
          error:
            "Invalid Deep Review request.",
        },
      );

      return;
    }

    if (
      error instanceof
      GitHubRepositoryError
    ) {
      const resolved =
        repositoryError(
          error,
        );

      json(
        response,
        resolved.status,
        {
          error:
            resolved.message,
        },
      );

      return;
    }

    if (
      error instanceof
      KiroHeadlessError
    ) {
      console.error(
        "Kiro review failed:",
        error.message,
      );

      json(
        response,
        error.message
          .toLowerCase()
          .includes(
            "timed out",
          )
          ? 504
          : 502,
        {
          error:
            "Kiro Deep Review could not be completed.",
        },
      );

      return;
    }

    if (
      error instanceof
        Error &&
      error.message ===
        "REQUEST_TOO_LARGE"
    ) {
      json(
        response,
        413,
        {
          error:
            "Request body is too large.",
        },
      );

      return;
    }

    console.error(
      "Worker error:",
      error,
    );

    json(
      response,
      500,
      {
        error:
          "Unexpected Kiro worker error.",
      },
    );
  } finally {
    reviewRunning =
      false;

    if (
      repository
    ) {
      await repository.cleanup();
    }
  }
}

const server =
  createServer(
    async (
      request,
      response,
    ) => {
      if (
        request.method ===
          "GET" &&
        request.url ===
          "/health"
      ) {
        json(
          response,
          200,
          {
            status: "ok",
            reviewRunning,
          },
        );

        return;
      }

      if (
        request.method ===
          "POST" &&
        request.url ===
          "/deep-review"
      ) {
        await handleDeepReview(
          request,
          response,
        );

        return;
      }

      json(
        response,
        404,
        {
          error:
            "Not found.",
        },
      );
    },
  );

server.listen(
  PORT,
  HOST,
  () => {
    console.log(
      `ComplyGuard Kiro worker listening on ${HOST}:${PORT}`,
    );
  },
);

import { relative } from "node:path";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getRulesForFrameworks } from "@/scanner/core/rule-selector";
import { scanProject } from "@/scanner/core/scanner";
import { createSarifReport } from "@/scanner/reporters/sarif-reporter";
import type { ComplianceFramework } from "@/scanner/types/finding";
import {
  downloadGitHubRepository,
  GitHubRepositoryError,
} from "@/server/github-repository";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  repositoryUrl: z.string().url().max(500),
  frameworks: z
    .array(z.enum(["gdpr", "soc2", "iso27001"]))
    .min(1)
    .max(3),
});

function resolveErrorResponse(error: unknown): {
  message: string;
  status: number;
} {
  // Client validation error — the request body was malformed.
  if (error instanceof z.ZodError) {
    return { message: "Invalid scan request.", status: 400 };
  }

  // Typed domain errors from the GitHub layer.
  if (error instanceof GitHubRepositoryError) {
    switch (error.code) {
      case "invalid_url":
        return { message: error.message, status: 400 };

      case "rate_limited":
        return { message: error.message, status: 429 };

      case "not_found":
        return {
          message: "Repository was not found or is not publicly accessible.",
          status: 404,
        };

      case "too_large":
        return { message: error.message, status: 413 };

      case "download_failed":
      case "extract_failed":
        return {
          message: "Unable to download or extract the repository. Please try again.",
          status: 502,
        };
    }
  }

  // All other errors are internal — do not leak implementation details.
  return { message: "An unexpected scanner error occurred.", status: 500 };
}

export async function POST(request: Request) {
  let repository:
    | Awaited<ReturnType<typeof downloadGitHubRepository>>
    | undefined;

  try {
    const body = requestSchema.parse(await request.json());

    repository = await downloadGitHubRepository(body.repositoryUrl);

    const frameworks = body.frameworks as ComplianceFramework[];

    const result = scanProject(
      repository.rootPath,
      getRulesForFrameworks(frameworks),
    );

    const findings = result.findings.map((finding) => ({
      ...finding,
      location: {
        ...finding.location,
        file: relative(result.projectPath, finding.location.file).replaceAll(
          "\\",
          "/",
        ),
      },
    }));

    return NextResponse.json({
      repository: {
        owner: repository.owner,
        name: repository.repository,
        branch: repository.defaultBranch,
        url: body.repositoryUrl,
      },
      frameworks,
      sourceFileCount: result.sourceFileCount,
      ruleCount: result.ruleCount,
      findingCount: findings.length,
      findings,
      sarif: createSarifReport(result),
    });
  } catch (error) {
    const { message, status } = resolveErrorResponse(error);

    return NextResponse.json({ error: message }, { status });
  } finally {
    if (repository) {
      await repository.cleanup();
    }
  }
}

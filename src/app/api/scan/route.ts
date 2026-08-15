import { relative } from "node:path";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getRulesForFrameworks } from "@/scanner/core/rule-selector";
import { scanProject } from "@/scanner/core/scanner";
import { createSarifReport } from "@/scanner/reporters/sarif-reporter";
import type { ComplianceFramework } from "@/scanner/types/finding";
import { downloadGitHubRepository } from "@/server/github-repository";

export const runtime = "nodejs";
export const maxDuration = 60;

const requestSchema = z.object({
  repositoryUrl: z.string().url().max(500),
  frameworks: z
    .array(z.enum(["gdpr", "soc2", "iso27001"]))
    .min(1)
    .max(3),
});

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
        file: relative(
          result.projectPath,
          finding.location.file,
        ).replaceAll("\\", "/"),
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
    const message =
      error instanceof z.ZodError
        ? "Invalid scan request."
        : error instanceof Error
          ? error.message
          : "Unexpected scan failure.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      },
    );
  } finally {
    if (repository) {
      await repository.cleanup();
    }
  }
}

import {
  readFileSync,
} from "node:fs";
import {
  relative,
  resolve,
  sep,
} from "node:path";

import type {
  DeepReviewRequest,
  SourceContext,
} from "@/ai/types";
import type { RepositoryProfile } from "@/intelligence/types";
import { correlateFindings } from "@/scanner/correlation";
import type { EngineeringPosture } from "@/scanner/scoring/posture-score";
import type {
  ComplianceFinding,
  ComplianceFramework,
} from "@/scanner/types/finding";

function assertInsideProject(
  projectPath: string,
  filePath: string,
): string {
  const project =
    resolve(projectPath);

  const target =
    resolve(filePath);

  if (
    target !== project &&
    !target.startsWith(
      `${project}${sep}`,
    )
  ) {
    throw new Error(
      "Finding source is outside the analyzed repository.",
    );
  }

  return target;
}

function sourceContext(
  projectPath: string,
  finding: ComplianceFinding,
): SourceContext | null {
  try {
    const file =
      assertInsideProject(
        projectPath,
        finding.location.file,
      );

    const lines =
      readFileSync(
        file,
        "utf8",
      ).split(/\r?\n/);

    const line =
      Math.max(
        1,
        finding.location.line,
      );

    const startLine =
      Math.max(
        1,
        line - 8,
      );

    const endLine =
      Math.min(
        lines.length,
        line + 8,
      );

    return {
      file: relative(
        projectPath,
        file,
      ).replaceAll("\\", "/"),
      startLine,
      endLine,
      content: lines
        .slice(
          startLine - 1,
          endLine,
        )
        .map(
          (value, index) =>
            `${startLine + index}: ${value}`,
        )
        .join("\n"),
    };
  } catch {
    return null;
  }
}

export function createDeepReviewRequest(input: {
  projectPath: string;
  repository: RepositoryProfile;
  frameworks: ComplianceFramework[];
  posture: EngineeringPosture;
  findings: ComplianceFinding[];
}): DeepReviewRequest {
  const contexts =
    input.findings
      .slice(0, 20)
      .map((finding) =>
        sourceContext(
          input.projectPath,
          finding,
        ),
      )
      .filter(
        (
          context,
        ): context is SourceContext =>
          context !== null,
      );

  return {
    repository:
      input.repository,
    frameworks:
      input.frameworks,
    posture:
      input.posture,
    findings:
      input.findings.slice(
        0,
        20,
      ),
    rootRisks:
      correlateFindings(
        input.findings,
      ).slice(
        0,
        20,
      ),
    contexts,
  };
}

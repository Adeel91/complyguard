import {
  basename,
  resolve,
} from "node:path";

import {
  buildDeepReviewContexts,
} from "@/ai/context-pack";

import {
  buildDeepReviewRequest,
} from "@/ai/request-builder";

import type {
  ComplianceIntelligenceProvider,
  DeepReviewRequest,
  DeepReviewResult,
} from "@/ai/types";

import {
  profileRepository,
} from "@/intelligence/repository-profiler";

import type {
  RepositoryProfile,
} from "@/intelligence/types";

import {
  correlateFindings,
} from "@/scanner/correlation/correlation";

import type {
  RootRisk,
} from "@/scanner/correlation/types";

import {
  getRulesForFrameworks,
} from "@/scanner/core/rule-selector";

import {
  scanProject,
  type ScanResult,
} from "@/scanner/core/scanner";

import {
  calculateEngineeringPosture,
  type EngineeringPosture,
} from "@/scanner/scoring/posture-score";

import type {
  ComplianceFramework,
} from "@/scanner/types/finding";

export type PrepareDeepReviewOptions = {
  projectRoot: string;

  repository?: string;

  frameworks:
    ComplianceFramework[];

  maxRisks?: number;
};

export type PreparedDeepReview = {
  projectRoot: string;

  scan:
    ScanResult;

  repositoryProfile:
    RepositoryProfile;

  posture:
    EngineeringPosture;

  rootRisks:
    RootRisk[];

  reviewedRootRisks:
    RootRisk[];

  request:
    DeepReviewRequest;
};

export type ExecutedDeepReview = {
  prepared:
    PreparedDeepReview;

  review:
    DeepReviewResult;
};

export function prepareDeepReview(
  options:
    PrepareDeepReviewOptions,
): PreparedDeepReview {
  const projectRoot =
    resolve(
      options.projectRoot,
    );

  const maxRisks =
    Math.max(
      1,
      Math.min(
        options.maxRisks ??
          8,
        20,
      ),
    );

  const rules =
    getRulesForFrameworks(
      options.frameworks,
    );

  const scan =
    scanProject(
      projectRoot,
      rules,
    );

  const repositoryProfile =
    profileRepository(
      projectRoot,
    );

  const rootRisks =
    correlateFindings(
      scan.findings,
    );

  const reviewedRootRisks =
    rootRisks.slice(
      0,
      maxRisks,
    );

  const posture =
    calculateEngineeringPosture(
      scan.findings,
      options.frameworks,
    );

  const contexts =
    buildDeepReviewContexts(
      projectRoot,
      reviewedRootRisks,
      {
        maxRisks,
      },
    );

  const request =
    buildDeepReviewRequest({
      repository:
        options.repository ??
        basename(
          projectRoot,
        ),

      frameworks:
        options.frameworks,

      repositoryProfile,

      posture,

      rootRisks:
        reviewedRootRisks,

      contexts,
    });

  return {
    projectRoot,
    scan,
    repositoryProfile,
    posture,
    rootRisks,
    reviewedRootRisks,
    request,
  };
}

export async function executeDeepReview(
  prepared:
    PreparedDeepReview,

  provider:
    ComplianceIntelligenceProvider,
): Promise<ExecutedDeepReview> {
  const review =
    await provider.review(
      prepared.request,
    );

  return {
    prepared,
    review,
  };
}

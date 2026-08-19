import {
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";

import {
  rootRiskFamilyForRule,
} from "@/scanner/correlation/correlation";

import type {
  RootRisk,
} from "@/scanner/correlation/types";

import type {
  ComplianceFramework,
  FindingSeverity,
} from "@/scanner/types/finding";

export type VerificationRisk = {
  id: string;

  title: string;

  severity:
    FindingSeverity;

  category:
    RootRisk["category"];

  family:
    string;

  relativeFile:
    string;

  line:
    number;

  signalCount:
    number;

  frameworks:
    ComplianceFramework[];

  ruleIds:
    string[];

  evidence:
    string[];
};

export type PersistingRisk = {
  before:
    VerificationRisk;

  after:
    VerificationRisk;
};

export type RemediationVerification = {
  generatedAt:
    string;

  resolved:
    VerificationRisk[];

  persisting:
    PersistingRisk[];

  introduced:
    VerificationRisk[];

  summary: {
    beforeRootRisks:
      number;

    afterRootRisks:
      number;

    resolved:
      number;

    persisting:
      number;

    introduced:
      number;
  };

  methodology:
    string;

  disclaimer:
    string;
};

function relativeFile(
  projectRoot:
    string,

  file:
    string,
): string {
  const root =
    resolve(
      projectRoot,
    );

  const absoluteFile =
    isAbsolute(
      file,
    )
      ? resolve(
          file,
        )
      : resolve(
          root,
          file,
        );

  return relative(
    root,
    absoluteFile,
  )
    .split(
      sep,
    )
    .join(
      "/",
    );
}

function normalizeEvidence(
  value:
    string,
): string {
  return value
    .replace(
      /\s+/g,
      " ",
    )
    .trim()
    .toLowerCase();
}

function unique<T>(
  values:
    T[],
): T[] {
  return Array.from(
    new Set(
      values,
    ),
  );
}

function toVerificationRisk(
  risk:
    RootRisk,

  projectRoot:
    string,
): VerificationRisk {
  const firstFinding =
    risk.rawFindings[0];

  return {
    id:
      risk.id,

    title:
      risk.title,

    severity:
      risk.severity,

    category:
      risk.category,

    family:
      firstFinding
        ? rootRiskFamilyForRule(
            firstFinding.ruleId,
          )
        : "other",

    relativeFile:
      relativeFile(
        projectRoot,
        risk.evidence.file,
      ),

    line:
      risk.evidence.line,

    signalCount:
      risk.signalCount,

    frameworks:
      unique(
        risk.controls.map(
          (
            control,
          ) =>
            control.framework,
        ),
      ),

    ruleIds:
      unique(
        risk.rawFindings.map(
          (
            finding,
          ) =>
            finding.ruleId,
        ),
      ),

    evidence:
      unique(
        risk.rawFindings.map(
          (
            finding,
          ) =>
            normalizeEvidence(
              finding.evidence,
            ),
        ),
      ),
  };
}

function intersects(
  first:
    string[],

  second:
    string[],
): boolean {
  const values =
    new Set(
      second,
    );

  return first.some(
    (
      value,
    ) =>
      values.has(
        value,
      ),
  );
}

/**
 * Root-risk IDs intentionally are NOT used here.
 *
 * A remediation can move source lines, which changes the correlation ID.
 *
 * Instead we match:
 *
 * relative file
 * + canonical risk family
 * + overlapping deterministic rule identity
 * + overlapping deterministic evidence
 */
function sameObservedRisk(
  before:
    VerificationRisk,

  after:
    VerificationRisk,
): boolean {
  return (
    before.relativeFile ===
      after.relativeFile &&
    before.family ===
      after.family &&
    intersects(
      before.ruleIds,
      after.ruleIds,
    ) &&
    intersects(
      before.evidence,
      after.evidence,
    )
  );
}

export function verifyRemediation(
  {
    beforeProjectRoot,
    afterProjectRoot,
    beforeRootRisks,
    afterRootRisks,
  }: {
    beforeProjectRoot:
      string;

    afterProjectRoot:
      string;

    beforeRootRisks:
      RootRisk[];

    afterRootRisks:
      RootRisk[];
  },
): RemediationVerification {
  const before =
    beforeRootRisks.map(
      (
        risk,
      ) =>
        toVerificationRisk(
          risk,
          beforeProjectRoot,
        ),
    );

  const after =
    afterRootRisks.map(
      (
        risk,
      ) =>
        toVerificationRisk(
          risk,
          afterProjectRoot,
        ),
    );

  const consumedAfter =
    new Set<number>();

  const resolved:
    VerificationRisk[] =
      [];

  const persisting:
    PersistingRisk[] =
      [];

  for (
    const beforeRisk of
    before
  ) {
    const matchIndex =
      after.findIndex(
        (
          afterRisk,
          index,
        ) =>
          !consumedAfter.has(
            index,
          ) &&
          sameObservedRisk(
            beforeRisk,
            afterRisk,
          ),
      );

    if (
      matchIndex ===
      -1
    ) {
      resolved.push(
        beforeRisk,
      );

      continue;
    }

    consumedAfter.add(
      matchIndex,
    );

    persisting.push({
      before:
        beforeRisk,

      after:
        after[
          matchIndex
        ]!,
    });
  }

  const introduced =
    after.filter(
      (
        _risk,
        index,
      ) =>
        !consumedAfter.has(
          index,
        ),
    );

  return {
    generatedAt:
      new Date()
        .toISOString(),

    resolved,

    persisting,

    introduced,

    summary: {
      beforeRootRisks:
        before.length,

      afterRootRisks:
        after.length,

      resolved:
        resolved.length,

      persisting:
        persisting.length,

      introduced:
        introduced.length,
    },

    methodology:
      "A fresh deterministic scan compares the same relative source file, canonical engineering risk family, scanner rule identity and source evidence.",

    disclaimer:
      "Resolved means the original deterministic scanner evidence is no longer observed. It does not prove legal compliance, certification or complete security.",
  };
}

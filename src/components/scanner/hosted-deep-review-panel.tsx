"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  KeyRound,
  LoaderCircle,
  Sparkles,
} from "lucide-react";

type ComplianceFramework =
  | "gdpr"
  | "soc2"
  | "iso27001";

type DeepReviewVerdict =
  | "confirmed"
  | "likely"
  | "false-positive"
  | "needs-review";

type EvidenceAdequacy =
  | "sufficient"
  | "partial"
  | "insufficient";

type ReviewedRootRisk = {
  id: string;
  title: string;
  severity: string;
  category: string;
  signalCount: number;
  evidence: {
    file: string;
    line: number;
    column?: number;
  };
};

type DeepReviewRisk = {
  rootRiskId: string;
  verdict: DeepReviewVerdict;
  confidence: number;
  evidenceAdequacy: EvidenceAdequacy;
  reasoning: string;
  businessImpact: string;
  remediationPlan: string[];
  suggestedPatch: {
    file: string;
    rationale?: string;
    diff: string;
  } | null;
};

type HostedDeepReviewResponse = {
  deterministic: {
    sourceFileCount: number;
    ruleCount: number;
    rawFindingCount: number;
    rootRiskCount: number;
    reviewedRootRiskCount: number;
  };

  reviewedRootRisks: ReviewedRootRisk[];

  review: {
    provider: string;
    reviewedAt: string;
    executiveSummary: string;
    reviews: DeepReviewRisk[];
  };
};

type Props = {
  repositoryUrl: string;
  frameworks: ComplianceFramework[];
  rootRiskCount: number;
};

function readApiError(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error;
  }

  return "Kiro Deep Review could not be completed.";
}

function verdictLabel(
  verdict: DeepReviewVerdict,
): string {
  switch (verdict) {
    case "confirmed":
      return "Confirmed";

    case "likely":
      return "Likely";

    case "false-positive":
      return "False positive";

    case "needs-review":
      return "Needs review";
  }
}

function verdictClasses(
  verdict: DeepReviewVerdict,
): string {
  switch (verdict) {
    case "confirmed":
      return "border-red-400/20 text-red-200";

    case "likely":
      return "border-amber-300/20 text-amber-100";

    case "false-positive":
      return "border-emerald-300/20 text-emerald-100";

    case "needs-review":
      return "border-violet-300/20 text-violet-100";
  }
}

function ReviewCard({
  review,
  risk,
}: {
  review: DeepReviewRisk;
  risk: ReviewedRootRisk | undefined;
}) {
  const [patchOpen, setPatchOpen] =
    useState(false);

  return (
    <article className="border-t border-white/[0.08] py-8 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={[
            "border px-2 py-1 text-[10px] uppercase tracking-[0.16em]",
            verdictClasses(review.verdict),
          ].join(" ")}
        >
          {verdictLabel(review.verdict)}
        </span>

        {risk ? (
          <span className="text-[10px] uppercase tracking-[0.15em] text-white/30">
            {risk.severity}
          </span>
        ) : null}

        <span className="text-[10px] text-white/30">
          {Math.round(review.confidence * 100)}% confidence
        </span>
      </div>

      <h4 className="mt-4 text-lg font-medium tracking-[-0.03em] text-white">
        {risk?.title ??
          "Correlated engineering risk"}
      </h4>

      {risk ? (
        <p className="mt-2 break-all text-xs text-white/35">
          {risk.evidence.file}:{risk.evidence.line}
        </p>
      ) : null}

      <div className="mt-6 grid gap-7 lg:grid-cols-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">
            Kiro reasoning
          </p>

          <p className="mt-2 text-sm leading-6 text-white/62">
            {review.reasoning}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">
            Engineering impact
          </p>

          <p className="mt-2 text-sm leading-6 text-white/62">
            {review.businessImpact}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-[10px] uppercase tracking-[0.16em] text-white/28">
          Remediation
        </p>

        <ol className="mt-3 space-y-2">
          {review.remediationPlan.map(
            (step, index) => (
              <li
                key={`${review.rootRiskId}-${index}`}
                className="grid grid-cols-[24px_1fr] gap-3 text-sm leading-6 text-white/60"
              >
                <span className="text-[10px] text-violet-300/70">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span>{step}</span>
              </li>
            ),
          )}
        </ol>
      </div>

      {review.suggestedPatch ? (
        <div className="mt-6 border-t border-white/[0.07] pt-5">
          <button
            type="button"
            onClick={() =>
              setPatchOpen((current) => !current)
            }
            className="flex items-center gap-2 text-xs text-white/50 transition hover:text-white"
          >
            {patchOpen ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )}

            Suggested patch
          </button>

          {patchOpen ? (
            <pre className="mt-4 max-h-[420px] overflow-auto border border-white/[0.08] bg-black/25 p-4 text-[11px] leading-5 text-white/55">
              <code>
                {review.suggestedPatch.diff}
              </code>
            </pre>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function HostedDeepReviewPanel({
  repositoryUrl,
  frameworks,
  rootRiskCount,
}: Props) {
  const [accessCode, setAccessCode] =
    useState("");

  const [running, setRunning] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [result, setResult] =
    useState<HostedDeepReviewResponse | null>(
      null,
    );

  const reviewLimit =
    Math.min(8, Math.max(1, rootRiskCount));

  const riskById = useMemo(
    () =>
      new Map(
        (
          result?.reviewedRootRisks ?? []
        ).map((risk) => [
          risk.id,
          risk,
        ]),
      ),
    [result],
  );

  async function runDeepReview() {
    const token = accessCode.trim();

    if (!token || running || result) {
      return;
    }

    setRunning(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/deep-review",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "x-complyguard-review-token":
              token,
          },

          body: JSON.stringify({
            repositoryUrl,
            frameworks,
            maxRisks: reviewLimit,
          }),
        },
      );

      const payload: unknown =
        await response
          .json()
          .catch(() => null);

      if (!response.ok) {
        throw new Error(
          readApiError(payload),
        );
      }

      setResult(
        payload as HostedDeepReviewResponse,
      );

      setAccessCode("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Kiro Deep Review could not be completed.",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="border-t border-white/[0.09] py-20">
      <div className="grid gap-12 xl:grid-cols-[0.8fr_1.2fr] xl:gap-16">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.19em] text-violet-300/70">
            <Sparkles className="size-3" />
            Live Kiro review
          </div>

          <h3 className="mt-5 text-3xl font-medium tracking-[-0.05em] text-white sm:text-4xl">
            Reason beyond
            <span className="text-white/30">
              {" "}the signal.
            </span>
          </h3>

          <p className="mt-5 max-w-xl text-sm leading-6 text-white/46">
            Deterministic analysis finds and
            correlates the evidence first. Kiro
            then reviews only the grounded risk
            set with bounded repository context.
          </p>

          <div className="mt-8 border-l border-violet-300/35 pl-5">
            <p className="text-xs leading-5 text-white/50">
              Deep Review runs only when explicitly
              requested. A normal repository scan
              never consumes Kiro credits.
            </p>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-6 text-xs">
            <div>
              <dt className="text-[9px] uppercase tracking-[0.16em] text-white/25">
                Root risks
              </dt>

              <dd className="mt-1 text-white/68">
                {rootRiskCount}
              </dd>
            </div>

            <div>
              <dt className="text-[9px] uppercase tracking-[0.16em] text-white/25">
                Review set
              </dt>

              <dd className="mt-1 text-white/68">
                Up to {reviewLimit}
              </dd>
            </div>

            <div>
              <dt className="text-[9px] uppercase tracking-[0.16em] text-white/25">
                Agent
              </dt>

              <dd className="mt-1 text-white/68">
                Read only
              </dd>
            </div>

            <div>
              <dt className="text-[9px] uppercase tracking-[0.16em] text-white/25">
                Trigger
              </dt>

              <dd className="mt-1 text-white/68">
                Explicit only
              </dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-white/[0.1] pt-7">
          {!result ? (
            <>
              <div className="flex gap-3">
                <KeyRound className="mt-0.5 size-4 shrink-0 text-violet-300/65" />

                <div>
                  <p className="text-sm font-medium text-white/80">
                    Review access
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/40">
                    Enter the access code supplied
                    with the judging instructions.
                    This is not a Kiro credential.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="password"
                  value={accessCode}
                  disabled={running}
                  autoComplete="off"
                  placeholder="Deep Review access code"
                  onChange={(event) => {
                    setAccessCode(
                      event.target.value,
                    );

                    setError(null);
                  }}
                  className="min-h-11 min-w-0 flex-1 border border-white/[0.12] bg-white/[0.025] px-3 text-sm text-white outline-none placeholder:text-white/22 focus:border-violet-300/45"
                />

                <button
                  type="button"
                  disabled={
                    running ||
                    accessCode.trim() === ""
                  }
                  onClick={() =>
                    void runDeepReview()
                  }
                  className="inline-flex min-h-11 items-center justify-center gap-2 bg-violet-300 px-5 text-xs font-medium text-black transition hover:bg-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {running ? (
                    <>
                      <LoaderCircle className="size-3.5 animate-spin" />
                      Kiro is reviewing
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-3.5" />
                      Run Kiro Deep Review
                    </>
                  )}
                </button>
              </div>

              {running ? (
                <p className="mt-5 text-xs leading-5 text-white/45">
                  Kiro is reviewing the grounded
                  deterministic evidence. Keep this
                  page open while it completes.
                </p>
              ) : null}

              {error ? (
                <p className="mt-5 text-xs leading-5 text-red-200/80">
                  {error}
                </p>
              ) : null}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center border border-emerald-300/20">
                  <Check className="size-3.5 text-emerald-200" />
                </span>

                <div>
                  <p className="text-sm font-medium text-white">
                    Kiro Deep Review complete
                  </p>

                  <p className="mt-1 text-xs text-white/35">
                    {
                      result.review.reviews.length
                    }{" "}
                    root risks reviewed
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-[10px] uppercase tracking-[0.16em] text-violet-300/65">
                  Executive review
                </p>

                <p className="mt-3 text-sm leading-7 text-white/65">
                  {
                    result.review
                      .executiveSummary
                  }
                </p>
              </div>

              <div className="mt-10">
                {result.review.reviews.map(
                  (review) => (
                    <ReviewCard
                      key={
                        review.rootRiskId
                      }
                      review={review}
                      risk={riskById.get(
                        review.rootRiskId,
                      )}
                    />
                  ),
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

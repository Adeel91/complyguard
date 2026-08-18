"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "motion/react";

import type {
  ComplianceFinding,
  ComplianceFramework,
  FindingSeverity,
} from "@/scanner/types/finding";

type Technology = {
  name: string;
  category: string;
  evidence?: string;
};

type RiskSurface = {
  id: string;
  label: string;
  reasons: string[];
};

type RepositoryProfile = {
  primaryLanguage:
    | "typescript"
    | "javascript"
    | "mixed"
    | "unknown";

  sourceFileCount: number;

  technologies:
    Technology[];

  riskSurfaces:
    RiskSurface[];
};

type FrameworkPosture = {
  framework:
    ComplianceFramework;

  score: number;
  findingCount: number;
  weightedRisk: number;
  criticalCount: number;
  highCount: number;
};

type Posture = {
  score: number;

  frameworks:
    FrameworkPosture[];

  methodology: string;
  disclaimer: string;
};

type RootRisk = {
  id: string;
  title: string;
  severity:
    FindingSeverity;
  category: string;

  evidence: {
    file: string;
    line: number;
    column: number;
    snippets: string[];
  };

  controls: Array<{
    framework:
      ComplianceFramework;
    control: string;
    ruleIds: string[];
  }>;

  signalCount: number;
};

type Intelligence = {
  repositoryProfile:
    RepositoryProfile;

  rootRisks:
    RootRisk[];

  posture:
    Posture;

  report?: unknown;
};

type ScanResponse = {
  sourceFileCount: number;
  ruleCount: number;

  findings:
    ComplianceFinding[];

  frameworks:
    ComplianceFramework[];

  sarif?: unknown;

  intelligence?:
    Intelligence;

  repository?: unknown;
};

const availableFrameworks: Array<{
  id:
    ComplianceFramework;
  label: string;
}> = [
  {
    id: "gdpr",
    label: "GDPR",
  },
  {
    id: "soc2",
    label: "SOC 2",
  },
  {
    id: "iso27001",
    label: "ISO 27001",
  },
];

const frameworkLabels: Record<
  ComplianceFramework,
  string
> = {
  gdpr: "GDPR",
  soc2: "SOC 2",
  iso27001:
    "ISO 27001",
};

const severityRank: Record<
  FindingSeverity,
  number
> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

const severityColors: Record<
  FindingSeverity,
  string
> = {
  critical: "#f27484",
  high: "#e6a36d",
  medium: "#d8c678",
  low: "#77acff",
  info: "#938c99",
};

export function RepositoryScanner() {
  const [
    repositoryUrl,
    setRepositoryUrl,
  ] =
    useState("");

  const [
    enabledFrameworks,
    setEnabledFrameworks,
  ] = useState<
    ComplianceFramework[]
  >([
    "gdpr",
    "soc2",
    "iso27001",
  ]);

  const [
    result,
    setResult,
  ] =
    useState<ScanResponse | null>(
      null,
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    frameworkFilter,
    setFrameworkFilter,
  ] = useState<
    ComplianceFramework | "all"
  >("all");

  const [
    severityFilter,
    setSeverityFilter,
  ] = useState<
    FindingSeverity | "all"
  >("all");

  function toggleFramework(
    framework:
      ComplianceFramework,
  ) {
    setEnabledFrameworks(
      (
        current,
      ) => {
        if (
          current.includes(
            framework,
          )
        ) {
          if (
            current.length ===
            1
          ) {
            return current;
          }

          return current.filter(
            (
              item,
            ) =>
              item !==
              framework,
          );
        }

        return [
          ...current,
          framework,
        ];
      },
    );
  }

  async function runScan() {
    if (
      repositoryUrl.trim() ===
      ""
    ) {
      setError(
        "Enter a public GitHub repository URL.",
      );

      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response =
        await fetch(
          "/api/scan",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                repositoryUrl:
                  repositoryUrl.trim(),

                frameworks:
                  enabledFrameworks,
              }),
          },
        );

      const payload =
        (await response.json()) as
          | ScanResponse
          | {
              message?: string;
              error?: string;
            };

      if (
        !response.ok
      ) {
        let message =
          "Repository scan failed.";

        if (
          "message" in
            payload &&
          typeof payload.message ===
            "string"
        ) {
          message =
            payload.message;
        } else if (
          "error" in
            payload &&
          typeof payload.error ===
            "string"
        ) {
          message =
            payload.error;
        }

        throw new Error(
          message,
        );
      }

      setResult(
        payload as ScanResponse,
      );
    } catch (
      scanError
    ) {
      setError(
        scanError instanceof
          Error
          ? scanError.message
          : "Repository scan failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredFindings =
    useMemo(() => {
      if (!result) {
        return [];
      }

      return [
        ...result.findings,
      ]
        .filter(
          (
            finding,
          ) =>
            frameworkFilter ===
              "all" ||
            finding.framework ===
              frameworkFilter,
        )
        .filter(
          (
            finding,
          ) =>
            severityFilter ===
              "all" ||
            finding.severity ===
              severityFilter,
        )
        .sort(
          (
            left,
            right,
          ) =>
            severityRank[
              right.severity
            ] -
            severityRank[
              left.severity
            ],
        );
    }, [
      result,
      frameworkFilter,
      severityFilter,
    ]);

  function download(
    filename: string,
    content: string,
  ) {
    const blob =
      new Blob(
        [
          content,
        ],
        {
          type:
            "application/json",
        },
      );

    const url =
      URL.createObjectURL(
        blob,
      );

    const anchor =
      document.createElement(
        "a",
      );

    anchor.href = url;
    anchor.download =
      filename;

    document.body.appendChild(
      anchor,
    );

    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(
      url,
    );
  }

  return (
    <section className="pb-32">
      <div className="cg-container">
        <div className="py-10 md:py-14">
          <div className="text-[10px] uppercase tracking-[0.1em] text-white/23">
            Analysis flow
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 text-[11px]">
            <span className="text-white/60">
              GitHub repository
            </span>

            <span className="text-[#a98cff]/55">
              →
            </span>

            <span className="text-white/42">
              repository profile
            </span>

            <span className="text-[#a98cff]/55">
              →
            </span>

            <span className="text-white/42">
              AST analysis
            </span>

            <span className="text-[#a98cff]/55">
              →
            </span>

            <span className="text-white/42">
              root risk correlation
            </span>

            <span className="text-[#a98cff]/55">
              →
            </span>

            <span className="text-white/42">
              control mapping
            </span>
          </div>

          <div className="mt-10 h-px bg-gradient-to-r from-white/[0.09] via-white/[0.05] to-transparent" />

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px] lg:items-start">
            <div>
              <label className="text-[11px] uppercase tracking-[0.09em] text-white/30">
                Repository URL
              </label>

              <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end">
                <input
                  value={
                    repositoryUrl
                  }
                  onChange={(
                    event,
                  ) =>
                    setRepositoryUrl(
                      event
                        .target
                        .value,
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                        "Enter" &&
                      !loading
                    ) {
                      void runScan();
                    }
                  }}
                  className="cg-input-line flex-1"
                  placeholder="https://github.com/owner/repository"
                  aria-label="Public GitHub repository URL"
                />

                <button
                  type="button"
                  onClick={() =>
                    void runScan()
                  }
                  disabled={
                    loading
                  }
                  className="cg-primary shrink-0 sm:mb-[3px] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {loading
                    ? "Analyzing"
                    : "Run analysis →"}
                </button>
              </div>

              <div className="mt-5 grid gap-5 text-[11px] leading-5 text-white/27 md:grid-cols-2">
                <div>
                  <span className="text-white/48">
                    Supported source
                  </span>

                  <p className="mt-1">
                    TypeScript, TSX, JavaScript and JSX files are analyzed by
                    the current scanner.
                  </p>
                </div>

                <div>
                  <span className="text-white/48">
                    Temporary processing
                  </span>

                  <p className="mt-1">
                    The GitHub archive is downloaded into temporary storage,
                    analyzed and cleaned up after the request completes.
                  </p>
                </div>
              </div>

              <div className="mt-7 flex items-start gap-3 border-l border-[#a98cff]/45 pl-4">
                <span className="mt-[2px] text-[11px] text-[#a98cff]">
                  25 MB
                </span>

                <p className="max-w-[760px] text-[11px] leading-5 text-white/31">
                  Hosted scans accept GitHub repository archives up to 25 MB.
                  This protects the hosted service from unexpectedly large
                  downloads, extraction and AST workloads. Larger repositories
                  can use the same deterministic scanner locally with{" "}
                  <code className="text-[#7fe1cf]/70">
                    pnpm scan ./path/to/project
                  </code>
                  .
                </p>
              </div>
            </div>

            <div>
              <div className="text-[11px] uppercase tracking-[0.09em] text-white/30">
                Rule packs
              </div>

              <p className="mt-3 text-[11px] leading-5 text-white/27">
                Choose which engineering control rule packs should execute.
                Selecting a framework does not mean ComplyGuard is performing
                a legal compliance audit.
              </p>

              <div className="mt-5 flex flex-wrap gap-7">
                {availableFrameworks.map(
                  (
                    framework,
                  ) => {
                    const active =
                      enabledFrameworks.includes(
                        framework.id,
                      );

                    return (
                      <button
                        key={
                          framework.id
                        }
                        type="button"
                        data-active={
                          active
                        }
                        onClick={() =>
                          toggleFramework(
                            framework.id,
                          )
                        }
                        className="cg-framework-toggle"
                      >
                        {
                          framework.label
                        }
                      </button>
                    );
                  },
                )}
              </div>

              <div className="mt-7 space-y-4 text-[10px] leading-5">
                <FrameworkExplanation
                  label="GDPR"
                  description="Privacy and personal data related engineering signals."
                />

                <FrameworkExplanation
                  label="SOC 2"
                  description="Security, access, logging and operational control signals."
                />

                <FrameworkExplanation
                  label="ISO 27001"
                  description="Information security engineering signals mapped to relevant controls."
                />
              </div>
            </div>
          </div>

          <div className="mt-12 h-px bg-gradient-to-r from-white/[0.09] via-white/[0.05] to-transparent" />

          <div className="mt-9 grid gap-8 md:grid-cols-3">
            <ScanOutput
              number="01"
              title="Repository profile"
              text="Detected technologies and engineering risk surfaces provide context around the scan."
            />

            <ScanOutput
              number="02"
              title="Root risks"
              text="Repeated framework signals are correlated into the underlying engineering problem where possible."
            />

            <ScanOutput
              number="03"
              title="Source evidence"
              text="Every deterministic finding keeps its rule, framework, file, source location, evidence and remediation."
            />
          </div>
        </div>

        <AnimatePresence
          mode="wait"
        >
          {error && (
            <motion.div
              key="error"
              initial={{
                opacity: 0,
                y: 8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
              className="py-10"
            >
              <div className="flex max-w-[900px] items-start gap-4">
                <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-[#f27484] shadow-[0_0_12px_rgba(242,116,132,.7)]" />

                <div>
                  <div className="text-[11px] uppercase tracking-[0.09em] text-[#f27484]">
                    Analysis could not start
                  </div>

                  <p className="mt-3 text-[13px] leading-6 text-white/57">
                    {error}
                  </p>

                  {error.includes("25 MB") && (
                    <div className="mt-5 text-[11px] leading-6 text-white/29">
                      The hosted limit applies to the downloaded GitHub archive,
                      not only to TypeScript or JavaScript source. Large assets,
                      fixtures or other repository files can therefore push an
                      otherwise scannable project above the hosted limit.
                      <br />
                      <br />
                      For a larger repository, run the same scanner locally:
                      {" "}
                      <code className="text-[#7fe1cf]/72">
                        pnpm scan ./path/to/project
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {loading && (
            <LoadingExperience
              key="loading"
            />
          )}

          {result &&
            !loading && (
              <motion.div
                key="result"
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.55,
                }}
              >
                <Results
                  result={
                    result
                  }
                  findings={
                    filteredFindings
                  }
                  frameworkFilter={
                    frameworkFilter
                  }
                  severityFilter={
                    severityFilter
                  }
                  setFrameworkFilter={
                    setFrameworkFilter
                  }
                  setSeverityFilter={
                    setSeverityFilter
                  }
                  exportJson={() =>
                    download(
                      "complyguard-report.json",
                      JSON.stringify(
                        result,
                        null,
                        2,
                      ),
                    )
                  }
                  exportSarif={() => {
                    if (
                      result.sarif !=
                      null
                    ) {
                      download(
                        "complyguard-report.sarif",
                        JSON.stringify(
                          result.sarif,
                          null,
                          2,
                        ),
                      );
                    }
                  }}
                />
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function FrameworkExplanation({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="grid grid-cols-[86px_1fr] gap-4">
      <span className="font-semibold text-white/55">
        {label}
      </span>

      <span className="text-white/25">
        {description}
      </span>
    </div>
  );
}

function ScanOutput({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <div className="text-[10px] text-[#a98cff]/60">
        {number}
      </div>

      <div className="mt-3 text-[13px] font-semibold text-white/68">
        {title}
      </div>

      <p className="mt-2 max-w-[380px] text-[11px] leading-5 text-white/26">
        {text}
      </p>
    </div>
  );
}

function LoadingExperience() {
  const stages = [
    "temporary repository ingestion",
    "repository profiling",
    "deterministic AST analysis",
    "root risk correlation",
    "control mapping",
  ];

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="py-20"
    >
      <div className="text-[11px] uppercase tracking-[0.1em] text-[#a98cff]">
        analysis running
      </div>

      <div className="mt-5 text-[32px] font-bold tracking-[-0.05em] text-white md:text-[44px]">
        Building the evidence graph…
      </div>

      <div className="mt-10 h-px overflow-hidden bg-white/[0.07]">
        <motion.div
          className="h-full w-[34%] bg-gradient-to-r from-transparent via-[#a98cff] to-transparent"
          animate={{
            x: [
              "-120%",
              "340%",
            ],
          }}
          transition={{
            duration: 1.8,
            repeat:
              Infinity,
            ease:
              "easeInOut",
          }}
        />
      </div>

      <div className="mt-9 flex flex-wrap gap-x-10 gap-y-4">
        {stages.map(
          (
            stage,
            index,
          ) => (
            <motion.div
              key={stage}
              animate={{
                opacity: [
                  0.22,
                  0.8,
                  0.22,
                ],
              }}
              transition={{
                duration: 2,
                repeat:
                  Infinity,
                delay:
                  index *
                  0.22,
              }}
              className="text-[11px] text-white/42"
            >
              0
              {index + 1}
              {"  "}
              {stage}
            </motion.div>
          ),
        )}
      </div>
    </motion.div>
  );
}

function Results({
  result,
  findings,
  frameworkFilter,
  severityFilter,
  setFrameworkFilter,
  setSeverityFilter,
  exportJson,
  exportSarif,
}: {
  result:
    ScanResponse;

  findings:
    ComplianceFinding[];

  frameworkFilter:
    ComplianceFramework
    | "all";

  severityFilter:
    FindingSeverity
    | "all";

  setFrameworkFilter:
    (
      value:
        ComplianceFramework
        | "all",
    ) => void;

  setSeverityFilter:
    (
      value:
        FindingSeverity
        | "all",
    ) => void;

  exportJson:
    () => void;

  exportSarif:
    () => void;
}) {
  const rootRisks =
    result.intelligence
      ?.rootRisks ??
    [];

  const score =
    result.intelligence
      ?.posture.score;

  return (
    <div className="pt-12">
      <div className="cg-fade-line" />

      <div className="grid gap-8 py-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <div className="text-[10px] uppercase tracking-[0.1em] text-[#7fe1cf]/70">
            Analysis complete
          </div>

          <p className="mt-3 max-w-[760px] text-[12px] leading-6 text-white/33">
            Raw signals are individual deterministic rule matches. Root risks
            correlate related signals where they point to the same underlying
            engineering problem.
          </p>
        </div>

        <p className="max-w-[390px] text-[10px] leading-5 text-white/20">
          A clean result only means the active rules did not match the analyzed
          source. It does not prove security or regulatory compliance.
        </p>
      </div>

      <div className="grid gap-y-10 pb-12 sm:grid-cols-2 lg:grid-cols-5">
        <Metric
          label="Source files"
          value={
            result.sourceFileCount
          }
        />

        <Metric
          label="Rules"
          value={
            result.ruleCount
          }
        />

        <Metric
          label="Raw signals"
          value={
            result.findings.length
          }
        />

        <Metric
          label="Root risks"
          value={
            rootRisks.length
          }
        />

        <Metric
          label="Observed posture"
          value={
            score ==
            null
              ? "—"
              : `${score}`
          }
        />
      </div>

      <div className="cg-fade-line" />

      {result.intelligence && (
        <>
          <RepositoryProfileView
            intelligence={
              result.intelligence
            }
          />

          <RootRiskView
            risks={
              rootRisks
            }
          />
        </>
      )}

      <div className="py-24">
        <div className="flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="cg-eyebrow">
              Source evidence
            </div>

            <h2 className="cg-heading mt-6 text-[38px] text-white md:text-[48px]">
              Deterministic
              <span className="text-white/27">
                {" "}
                findings.
              </span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[11px]">
            <FilterSet
              values={[
                "all",
                "gdpr",
                "soc2",
                "iso27001",
              ]}
              current={
                frameworkFilter
              }
              onChange={(
                value,
              ) =>
                setFrameworkFilter(
                  value as
                    ComplianceFramework
                    | "all",
                )
              }
            />

            <span className="text-white/12">
              /
            </span>

            <FilterSet
              values={[
                "all",
                "critical",
                "high",
                "medium",
                "low",
              ]}
              current={
                severityFilter
              }
              onChange={(
                value,
              ) =>
                setSeverityFilter(
                  value as
                    FindingSeverity
                    | "all",
                )
              }
            />

            <span className="text-white/12">
              /
            </span>

            <button
              type="button"
              onClick={
                exportJson
              }
              className="text-white/36 transition hover:text-white"
            >
              JSON ↓
            </button>

            {result.sarif !=
              null && (
              <button
                type="button"
                onClick={
                  exportSarif
                }
                className="text-white/36 transition hover:text-white"
              >
                SARIF ↓
              </button>
            )}
          </div>
        </div>

        <div className="mt-12">
          {findings.length ===
          0 ? (
            <div className="py-16">
              <div className="text-[20px] font-bold text-white/75">
                No findings match the active filters.
              </div>

              <p className="mt-4 max-w-[680px] text-[13px] leading-6 text-white/32">
                This only means the active deterministic rules did not produce matching evidence. It is not proof that the repository is secure or compliant.
              </p>
            </div>
          ) : (
            findings.map(
              (
                finding,
                index,
              ) => (
                <FindingView
                  key={`${finding.ruleId}-${finding.location.file}-${finding.location.line}-${index}`}
                  finding={
                    finding
                  }
                  index={
                    index
                  }
                />
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value:
    string
    | number;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 18,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
      }}
    >
      <div className="text-[11px] uppercase tracking-[0.08em] text-white/26">
        {label}
      </div>

      <div className="mt-3 text-[38px] font-bold tracking-[-0.06em] text-white">
        {value}
      </div>
    </motion.div>
  );
}

function RepositoryProfileView({
  intelligence,
}: {
  intelligence:
    Intelligence;
}) {
  const profile =
    intelligence.repositoryProfile;

  return (
    <div className="py-28">
      <div className="grid gap-16 lg:grid-cols-[0.44fr_0.56fr]">
        <div>
          <div className="cg-eyebrow">
            Repository intelligence
          </div>

          <h2 className="cg-heading mt-6 text-[38px] text-white md:text-[48px]">
            What exists
            <br />

            <span className="text-white/27">
              around the evidence.
            </span>
          </h2>

          <p className="mt-6 max-w-[500px] text-[13px] leading-7 text-white/35">
            Technology and source structure provide context for interpreting deterministic findings.
          </p>
        </div>

        <div>
          <div className="text-[11px] uppercase tracking-[0.09em] text-white/25">
            Technologies
          </div>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
            {profile.technologies.length >
            0 ? (
              profile.technologies.map(
                (
                  technology,
                  index,
                ) => (
                  <div
                    key={`${technology.name}-${index}`}
                    className="text-[14px]"
                  >
                    <span className="text-white/76">
                      {
                        technology.name
                      }
                    </span>

                    <span className="ml-2 text-[10px] uppercase text-[#a98cff]/58">
                      {
                        technology.category
                      }
                    </span>
                  </div>
                ),
              )
            ) : (
              <div className="text-[13px] text-white/32">
                No recognized technology dependencies.
              </div>
            )}
          </div>

          <div className="mt-14 text-[11px] uppercase tracking-[0.09em] text-white/25">
            Risk surfaces
          </div>

          <div className="mt-4">
            {profile.riskSurfaces.map(
              (
                surface,
                index,
              ) => (
                <motion.div
                  key={
                    surface.id
                  }
                  initial={{
                    opacity: 0,
                    x: 18,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay:
                      index *
                      0.04,
                  }}
                  className="grid gap-2 border-t border-white/[0.065] py-5 md:grid-cols-[190px_1fr]"
                >
                  <div className="text-[13px] font-semibold text-white/72">
                    {
                      surface.label
                    }
                  </div>

                  <div className="text-[12px] leading-6 text-white/32">
                    {
                      surface.reasons[
                        0
                      ] ??
                      "Observed repository surface."
                    }
                  </div>
                </motion.div>
              ),
            )}
          </div>

          <div className="mt-14 text-[11px] uppercase tracking-[0.09em] text-white/25">
            Framework posture
          </div>

          <div className="mt-6 space-y-6">
            {intelligence.posture.frameworks.map(
              (
                framework,
              ) => (
                <div
                  key={
                    framework.framework
                  }
                >
                  <div className="flex items-end justify-between">
                    <span className="text-[13px] text-white/58">
                      {
                        frameworkLabels[
                          framework
                            .framework
                        ]
                      }
                    </span>

                    <span className="text-[16px] font-bold text-white/78">
                      {
                        framework.score
                      }
                    </span>
                  </div>

                  <div className="mt-3 h-px bg-white/[0.07]">
                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      whileInView={{
                        width: `${framework.score}%`,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        duration: 0.9,
                        ease: [
                          0.22,
                          1,
                          0.36,
                          1,
                        ],
                      }}
                      className="h-px bg-gradient-to-r from-[#a98cff] to-[#7fe1cf]"
                    />
                  </div>
                </div>
              ),
            )}
          </div>

          <p className="mt-8 text-[10px] leading-5 text-white/22">
            {
              intelligence.posture.disclaimer
            }
          </p>
        </div>
      </div>
    </div>
  );
}

function RootRiskView({
  risks,
}: {
  risks: RootRisk[];
}) {
  if (
    risks.length ===
    0
  ) {
    return null;
  }

  return (
    <div className="pb-24">
      <div className="cg-eyebrow">
        Correlated root risks
      </div>

      <h2 className="cg-heading mt-6 max-w-[760px] text-[38px] text-white md:text-[48px]">
        {
          risks.length
        }{" "}
        underlying{" "}
        {risks.length ===
        1
          ? "risk"
          : "risks"}
        <span className="text-white/27">
          {" "}
          behind the signals.
        </span>
      </h2>

      <div className="mt-16">
        {risks.map(
          (
            risk,
            index,
          ) => (
            <motion.article
              key={
                risk.id
              }
              initial={{
                opacity: 0,
                y: 24,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                delay:
                  index *
                  0.045,
              }}
              className="grid gap-9 border-t border-white/[0.075] py-10 lg:grid-cols-[125px_1fr_0.7fr]"
            >
              <div>
                <div
                  className="cg-severity-dot"
                  style={{
                    background:
                      severityColors[
                        risk.severity
                      ],
                    boxShadow:
                      `0 0 11px ${severityColors[risk.severity]}`,
                  }}
                />

                <div
                  className="mt-3 text-[10px] uppercase tracking-[0.08em]"
                  style={{
                    color:
                      severityColors[
                        risk.severity
                      ],
                  }}
                >
                  {
                    risk.severity
                  }
                </div>

                <div className="mt-2 text-[10px] text-white/24">
                  {
                    risk.signalCount
                  }{" "}
                  signals
                </div>
              </div>

              <div>
                <h3 className="text-[20px] font-bold tracking-[-0.04em] text-white/84">
                  {
                    risk.title
                  }
                </h3>

                <code className="mt-4 block text-[11px] text-[#77acff]/60">
                  {
                    risk.evidence.file
                  }
                  :
                  {
                    risk.evidence.line
                  }
                </code>

                {risk.evidence.snippets[
                  0
                ] && (
                  <pre className="mt-5 overflow-x-auto border-l border-[#f27484]/50 pl-5 text-[12px] leading-6 text-white/42">
                    <code>
                      {
                        risk.evidence.snippets[
                          0
                        ]
                      }
                    </code>
                  </pre>
                )}
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-[0.09em] text-white/24">
                  Control impact
                </div>

                <div className="mt-4 space-y-4">
                  {risk.controls.map(
                    (
                      control,
                      controlIndex,
                    ) => (
                      <div
                        key={`${control.framework}-${control.control}-${controlIndex}`}
                      >
                        <span className="text-[11px] font-semibold text-[#a98cff]">
                          {
                            frameworkLabels[
                              control.framework
                            ]
                          }
                        </span>

                        <span className="ml-3 text-[11px] text-white/34">
                          {
                            control.control
                          }
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </motion.article>
          ),
        )}
      </div>
    </div>
  );
}

function FilterSet({
  values,
  current,
  onChange,
}: {
  values: string[];
  current: string;

  onChange:
    (
      value: string,
    ) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4">
      {values.map(
        (
          value,
        ) => (
          <button
            key={value}
            type="button"
            onClick={() =>
              onChange(
                value,
              )
            }
            className={`capitalize transition ${
              current ===
              value
                ? "text-[#c6b4ff]"
                : "text-white/27 hover:text-white/65"
            }`}
          >
            {value}
          </button>
        ),
      )}
    </div>
  );
}

function FindingView({
  finding,
  index,
}: {
  finding:
    ComplianceFinding;

  index: number;
}) {
  const color =
    severityColors[
      finding.severity
    ];

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 22,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.12,
      }}
      transition={{
        delay:
          Math.min(
            index *
              0.025,
            0.2,
          ),
      }}
      className="grid gap-8 border-t border-white/[0.07] py-11 lg:grid-cols-[135px_1fr]"
    >
      <div>
        <span
          className="cg-severity-dot block"
          style={{
            background:
              color,
            boxShadow:
              `0 0 10px ${color}`,
          }}
        />

        <div
          className="mt-3 text-[10px] uppercase tracking-[0.08em]"
          style={{
            color,
          }}
        >
          {
            finding.severity
          }
        </div>

        <div className="mt-4 text-[10px] text-white/23">
          {
            frameworkLabels[
              finding.framework
            ]
          }
        </div>

        <div className="mt-1 break-all text-[9px] text-white/18">
          {
            finding.ruleId
          }
        </div>
      </div>

      <div>
        <h3 className="max-w-[900px] text-[20px] font-bold tracking-[-0.04em] text-white/85">
          {
            finding.title
          }
        </h3>

        <p className="mt-4 max-w-[900px] text-[13px] leading-7 text-white/37">
          {
            finding.description
          }
        </p>

        <div className="mt-7 grid gap-10 xl:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="text-[10px] uppercase tracking-[0.09em] text-white/22">
              Evidence
            </div>

            <code className="mt-3 block text-[11px] text-[#77acff]/65">
              {
                finding.location.file
              }
              :
              {
                finding.location.line
              }
              :
              {
                finding.location.column
              }
            </code>

            <pre className="mt-5 overflow-x-auto border-l border-white/[0.14] pl-5 text-[12px] leading-6 text-white/43">
              <code>
                {
                  finding.evidence
                }
              </code>
            </pre>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.09em] text-white/22">
              {
                finding.control
              }
            </div>

            <p className="mt-5 text-[12px] leading-6 text-white/38">
              {
                finding.remediation
              }
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

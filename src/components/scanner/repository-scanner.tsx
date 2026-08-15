"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  ComplianceFinding,
  ComplianceFramework,
  FindingSeverity,
} from "@/scanner/types/finding";

type WebFinding = Omit<
  ComplianceFinding,
  "location"
> & {
  location: {
    file: string;
    line: number;
    column: number;
  };
};

type ScanResponse = {
  repository: {
    owner: string;
    name: string;
    branch: string;
    url: string;
  };
  frameworks: ComplianceFramework[];
  sourceFileCount: number;
  ruleCount: number;
  findingCount: number;
  findings: WebFinding[];
  sarif: unknown;
};

const FRAMEWORKS: Array<{
  id: ComplianceFramework;
  label: string;
  short: string;
}> = [
  {
    id: "gdpr",
    label: "GDPR",
    short: "Privacy engineering",
  },
  {
    id: "soc2",
    label: "SOC 2",
    short: "Security controls",
  },
  {
    id: "iso27001",
    label: "ISO 27001",
    short: "Information security",
  },
];

const SEVERITIES: Array<{
  id: FindingSeverity;
  label: string;
}> = [
  {
    id: "critical",
    label: "Critical",
  },
  {
    id: "high",
    label: "High",
  },
  {
    id: "medium",
    label: "Medium",
  },
  {
    id: "low",
    label: "Low",
  },
  {
    id: "info",
    label: "Info",
  },
];

function downloadJson(
  filename: string,
  value: unknown,
) {
  const blob = new Blob(
    [JSON.stringify(value, null, 2)],
    {
      type: "application/json",
    },
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

function severityClasses(
  severity: FindingSeverity,
) {
  switch (severity) {
    case "critical":
      return {
        dot: "bg-[#ef3f46]",
        badge:
          "border-[#ef3f46]/20 bg-[#ef3f46]/[0.08] text-[#d93038]",
      };

    case "high":
      return {
        dot: "bg-orange-500",
        badge:
          "border-orange-500/20 bg-orange-500/[0.08] text-orange-700",
      };

    case "medium":
      return {
        dot: "bg-amber-400",
        badge:
          "border-amber-400/20 bg-amber-400/[0.09] text-amber-700",
      };

    default:
      return {
        dot: "bg-black/35",
        badge:
          "border-black/10 bg-black/[0.035] text-black/55",
      };
  }
}

export function RepositoryScanner() {
  const [repositoryUrl, setRepositoryUrl] =
    useState("");

  const [frameworks, setFrameworks] =
    useState<ComplianceFramework[]>([
      "gdpr",
      "soc2",
      "iso27001",
    ]);

  const [result, setResult] =
    useState<ScanResponse | null>(null);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    filterFramework,
    setFilterFramework,
  ] = useState<
    ComplianceFramework | "all"
  >("all");

  const [
    filterSeverity,
    setFilterSeverity,
  ] = useState<
    FindingSeverity | "all"
  >("all");

  function toggleFramework(
    framework: ComplianceFramework,
  ) {
    setFrameworks((current) => {
      if (current.includes(framework)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter(
          (item) =>
            item !== framework,
        );
      }

      return [
        ...current,
        framework,
      ];
    });
  }

  async function runScan() {
    setLoading(true);
    setError("");
    setResult(null);
    setFilterFramework("all");
    setFilterSeverity("all");

    try {
      const response =
        await fetch("/api/scan", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            repositoryUrl,
            frameworks,
          }),
        });

      const payload =
        await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error ??
            "Scan failed.",
        );
      }

      setResult(
        payload as ScanResponse,
      );
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Scan failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  const visibleFindings =
    (result?.findings ?? []).filter(
      (finding) => {
        if (
          filterFramework !== "all" &&
          finding.framework !==
            filterFramework
        ) {
          return false;
        }

        if (
          filterSeverity !== "all" &&
          finding.severity !==
            filterSeverity
        ) {
          return false;
        }

        return true;
      },
    );

  const presentFrameworks =
    new Set(
      result?.findings.map(
        (finding) =>
          finding.framework,
      ),
    );

  const presentSeverities =
    new Set(
      result?.findings.map(
        (finding) =>
          finding.severity,
      ),
    );

  const criticalCount =
    result?.findings.filter(
      (finding) =>
        finding.severity ===
        "critical",
    ).length ?? 0;

  const highCount =
    result?.findings.filter(
      (finding) =>
        finding.severity === "high",
    ).length ?? 0;

  return (
    <div className="space-y-7">
      <div className="cg-shadow overflow-hidden rounded-[30px] border border-black/[0.08] bg-white">
        <div className="grid lg:grid-cols-[1fr_340px]">
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[#111214] text-xs font-black text-white">
                GH
              </div>

              <div>
                <h2 className="text-lg font-semibold tracking-[-0.035em]">
                  Public GitHub repository
                </h2>

                <p className="mt-0.5 text-xs text-black/40">
                  Default branch • temporary processing
                </p>
              </div>
            </div>

            <div className="mt-7">
              <label
                htmlFor="repository"
                className="text-xs font-bold uppercase tracking-[0.13em] text-black/40"
              >
                Repository URL
              </label>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Input
                  id="repository"
                  value={repositoryUrl}
                  onChange={(event) =>
                    setRepositoryUrl(
                      event.target.value,
                    )
                  }
                  placeholder="https://github.com/owner/repository"
                  className="h-14 flex-1 rounded-2xl border-black/10 bg-[#f8f8f6] px-5 text-sm shadow-none focus-visible:ring-[#ef3f46]/20"
                />

                <Button
                  type="button"
                  onClick={runScan}
                  disabled={
                    loading ||
                    repositoryUrl
                      .trim()
                      .length === 0
                  }
                  className="h-14 min-w-[170px] rounded-2xl bg-[#ef3f46] px-6 font-semibold text-white shadow-[0_10px_26px_rgba(239,63,70,0.2)] hover:bg-[#d93038]"
                >
                  {loading
                    ? "Scanning..."
                    : "Run scan →"}
                </Button>
              </div>
            </div>

            {error ? (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#ef3f46]/20 bg-[#ef3f46]/[0.055] p-4">
                <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-[#ef3f46]/10 text-xs font-black text-[#d93038]">
                  !
                </div>

                <p className="text-sm leading-6 text-[#b52f35]">
                  {error}
                </p>
              </div>
            ) : null}
          </div>

          <div className="border-t border-black/[0.07] bg-[#f8f8f6] p-6 sm:p-8 lg:border-l lg:border-t-0">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-black/40">
              Analyze against
            </p>

            <div className="mt-4 space-y-2">
              {FRAMEWORKS.map(
                (framework) => {
                  const checked =
                    frameworks.includes(
                      framework.id,
                    );

                  return (
                    <label
                      key={
                        framework.id
                      }
                      className={[
                        "flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition",
                        checked
                          ? "border-black bg-[#111214] text-white shadow-sm"
                          : "border-black/[0.08] bg-white text-black hover:border-black/20",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={
                          checked
                        }
                        onChange={() =>
                          toggleFramework(
                            framework.id,
                          )
                        }
                      />

                      <div
                        className={[
                          "flex size-7 shrink-0 items-center justify-center rounded-lg border text-[10px] font-black",
                          checked
                            ? "border-white/20 bg-white/10 text-white"
                            : "border-black/10 bg-black/[0.03] text-black/40",
                        ].join(" ")}
                      >
                        {checked
                          ? "✓"
                          : ""}
                      </div>

                      <div>
                        <div className="text-sm font-semibold">
                          {
                            framework.label
                          }
                        </div>

                        <div
                          className={[
                            "mt-0.5 text-[10px]",
                            checked
                              ? "text-white/40"
                              : "text-black/35",
                          ].join(
                            " ",
                          )}
                        >
                          {
                            framework.short
                          }
                        </div>
                      </div>
                    </label>
                  );
                },
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="cg-shadow relative overflow-hidden rounded-[30px] border border-black/[0.08] bg-[#111214] p-8 text-white">
          <div className="cg-scan-line" />

          <div className="flex items-center gap-4">
            <div className="relative flex size-12 items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#ef3f46]/30" />
              <div className="absolute inset-2 animate-ping rounded-full bg-[#ef3f46]/20" />
              <div className="relative size-2.5 rounded-full bg-[#ef3f46]" />
            </div>

            <div>
              <h3 className="font-semibold">
                Analyzing repository
              </h3>

              <p className="mt-1 text-sm text-white/40">
                Downloading source,
                parsing AST and executing
                the selected rule packs.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {result ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                value:
                  result.sourceFileCount,
                label: "Source files",
              },
              {
                value:
                  result.ruleCount,
                label: "Rules executed",
              },
              {
                value:
                  result.findingCount,
                label: "Findings",
              },
              {
                value:
                  criticalCount,
                label: "Critical",
              },
              {
                value:
                  highCount,
                label: "High",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-[22px] border border-black/[0.08] bg-white p-5 shadow-sm"
              >
                <div className="text-3xl font-semibold tracking-[-0.055em]">
                  {stat.value}
                </div>

                <div className="mt-2 text-xs font-medium text-black/35">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          <div className="cg-shadow overflow-hidden rounded-[30px] border border-black/[0.08] bg-white">
            <div className="flex flex-col gap-5 border-b border-black/[0.07] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-[#111214] text-xs font-black text-white">
                  GH
                </div>

                <div>
                  <p className="text-base font-semibold tracking-[-0.03em]">
                    {
                      result.repository
                        .owner
                    }
                    /
                    {
                      result.repository
                        .name
                    }
                  </p>

                  <div className="mt-1 flex items-center gap-2 text-xs text-black/35">
                    <span>
                      Branch
                    </span>
                    <span className="rounded-md bg-black/[0.045] px-2 py-1 font-mono">
                      {
                        result
                          .repository
                          .branch
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadJson(
                      "complyguard-report.json",
                      result,
                    )
                  }
                  className="rounded-xl border-black/10 bg-white shadow-none"
                >
                  ↓ JSON
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    downloadJson(
                      "complyguard-report.sarif",
                      result.sarif,
                    )
                  }
                  className="rounded-xl border-black/10 bg-white shadow-none"
                >
                  ↓ SARIF
                </Button>
              </div>
            </div>

            {result.findings.length >
            0 ? (
              <div className="border-b border-black/[0.07] bg-[#f8f8f6] p-5 sm:p-6">
                <div className="grid gap-5 xl:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/35">
                      Framework
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFilterFramework(
                            "all",
                          )
                        }
                        className={[
                          "rounded-xl border px-3.5 py-2 text-xs font-semibold transition",
                          filterFramework ===
                          "all"
                            ? "border-black bg-[#111214] text-white"
                            : "border-black/10 bg-white text-black/50 hover:border-black/25",
                        ].join(
                          " ",
                        )}
                      >
                        All
                      </button>

                      {FRAMEWORKS.filter(
                        (framework) =>
                          presentFrameworks.has(
                            framework.id,
                          ),
                      ).map(
                        (
                          framework,
                        ) => (
                          <button
                            key={
                              framework.id
                            }
                            type="button"
                            onClick={() =>
                              setFilterFramework(
                                framework.id,
                              )
                            }
                            className={[
                              "rounded-xl border px-3.5 py-2 text-xs font-semibold transition",
                              filterFramework ===
                              framework.id
                                ? "border-black bg-[#111214] text-white"
                                : "border-black/10 bg-white text-black/50 hover:border-black/25",
                            ].join(
                              " ",
                            )}
                          >
                            {
                              framework.label
                            }
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/35">
                      Severity
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFilterSeverity(
                            "all",
                          )
                        }
                        className={[
                          "rounded-xl border px-3.5 py-2 text-xs font-semibold transition",
                          filterSeverity ===
                          "all"
                            ? "border-black bg-[#111214] text-white"
                            : "border-black/10 bg-white text-black/50 hover:border-black/25",
                        ].join(
                          " ",
                        )}
                      >
                        All
                      </button>

                      {SEVERITIES.filter(
                        (severity) =>
                          presentSeverities.has(
                            severity.id,
                          ),
                      ).map(
                        (
                          severity,
                        ) => (
                          <button
                            key={
                              severity.id
                            }
                            type="button"
                            onClick={() =>
                              setFilterSeverity(
                                severity.id,
                              )
                            }
                            className={[
                              "rounded-xl border px-3.5 py-2 text-xs font-semibold transition",
                              filterSeverity ===
                              severity.id
                                ? "border-black bg-[#111214] text-white"
                                : "border-black/10 bg-white text-black/50 hover:border-black/25",
                            ].join(
                              " ",
                            )}
                          >
                            {
                              severity.label
                            }
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-black/35">
                  Showing{" "}
                  {
                    visibleFindings.length
                  }{" "}
                  of{" "}
                  {
                    result.findings
                      .length
                  }{" "}
                  findings
                </p>
              </div>
            ) : null}

            <div className="p-5 sm:p-6">
              {result.findings
                .length === 0 ? (
                <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
                  <div className="flex size-16 items-center justify-center rounded-[22px] bg-emerald-500/10 text-xl font-bold text-emerald-600">
                    ✓
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold tracking-[-0.04em]">
                    No findings
                    detected.
                  </h3>

                  <p className="mt-3 max-w-lg text-sm leading-7 text-black/45">
                    The selected rule
                    packs did not detect
                    a mapped risk pattern
                    in the analyzed source.
                    This does not certify
                    the repository as
                    compliant.
                  </p>
                </div>
              ) : visibleFindings.length ===
                0 ? (
                <div className="flex min-h-[260px] items-center justify-center text-center">
                  <p className="text-sm text-black/40">
                    No findings match
                    the selected filters.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {visibleFindings.map(
                    (
                      finding,
                      index,
                    ) => {
                      const severity =
                        severityClasses(
                          finding.severity,
                        );

                      return (
                        <article
                          key={`${finding.ruleId}-${finding.location.file}-${finding.location.line}-${index}`}
                          className="group overflow-hidden rounded-[24px] border border-black/[0.08] bg-white transition hover:border-black/15 hover:shadow-[0_14px_40px_rgba(16,17,18,0.06)]"
                        >
                          <div className="grid lg:grid-cols-[1fr_1fr]">
                            <div className="p-5 sm:p-6">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`size-2 rounded-full ${severity.dot}`}
                                />

                                <Badge
                                  variant="outline"
                                  className={`rounded-lg px-2.5 py-1 text-[9px] font-bold tracking-[0.08em] ${severity.badge}`}
                                >
                                  {finding.severity.toUpperCase()}
                                </Badge>

                                <Badge
                                  variant="outline"
                                  className="rounded-lg border-black/10 bg-black/[0.025] px-2.5 py-1 text-[9px] font-bold text-black/45"
                                >
                                  {finding.framework.toUpperCase()}
                                </Badge>

                                <span className="text-[10px] font-semibold text-black/25">
                                  {
                                    finding.ruleId
                                  }
                                </span>
                              </div>

                              <h3 className="mt-5 text-xl font-semibold tracking-[-0.035em]">
                                {
                                  finding.title
                                }
                              </h3>

                              <p className="mt-3 text-sm leading-7 text-black/45">
                                {
                                  finding.description
                                }
                              </p>

                              <div className="mt-6 rounded-2xl bg-[#f7f7f5] p-4">
                                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-black/30">
                                  Control
                                </p>

                                <p className="mt-2 text-sm font-semibold">
                                  {
                                    finding.control
                                  }
                                </p>
                              </div>
                            </div>

                            <div className="border-t border-black/[0.07] bg-[#f8f8f6] p-5 sm:p-6 lg:border-l lg:border-t-0">
                              <div className="flex items-center justify-between gap-3">
                                <p className="truncate font-mono text-[11px] font-semibold text-black/55">
                                  {
                                    finding
                                      .location
                                      .file
                                  }
                                  :
                                  {
                                    finding
                                      .location
                                      .line
                                  }
                                  :
                                  {
                                    finding
                                      .location
                                      .column
                                  }
                                </p>

                                <span className="shrink-0 rounded-md bg-black/[0.045] px-2 py-1 text-[9px] font-semibold text-black/35">
                                  SOURCE
                                </span>
                              </div>

                              <pre className="mt-4 max-h-[180px] overflow-auto whitespace-pre-wrap rounded-2xl bg-[#111214] p-4 font-mono text-[11px] leading-6 text-white/70">
                                {
                                  finding.evidence
                                }
                              </pre>

                              <div className="mt-5">
                                <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-black/30">
                                  Recommended
                                  remediation
                                </p>

                                <p className="mt-2 text-sm leading-7 text-black/55">
                                  {
                                    finding.remediation
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              title:
                "Exact source evidence",
              description:
                "Every result points back to the source file, line and AST expression that triggered the rule.",
            },
            {
              title:
                "Framework mapping",
              description:
                "Findings are mapped to relevant GDPR, SOC 2 or ISO 27001 engineering controls.",
            },
            {
              title:
                "Actionable remediation",
              description:
                "Results explain what was detected and what engineering change should be considered.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[24px] border border-black/[0.07] bg-white/65 p-6"
            >
              <div className="size-8 rounded-xl border border-black/10 bg-black/[0.035]" />

              <h3 className="mt-6 text-base font-semibold tracking-[-0.03em]">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-black/40">
                {
                  item.description
                }
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

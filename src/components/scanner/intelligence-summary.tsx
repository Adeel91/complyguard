import {
  BrainCircuit,
  Database,
  Fingerprint,
  GitBranch,
  Layers3,
  Radar,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type Framework =
  | "gdpr"
  | "soc2"
  | "iso27001";

type Severity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info";

interface Technology {
  name: string;
  category: string;
  evidence: string;
}

interface RiskSurface {
  id: string;
  label: string;
  reasons: string[];
}

interface RepositoryProfile {
  primaryLanguage:
    | "typescript"
    | "javascript"
    | "mixed"
    | "unknown";
  sourceFileCount: number;
  technologies: Technology[];
  riskSurfaces: RiskSurface[];
}

interface RootRiskControl {
  framework: Framework;
  control: string;
  ruleIds: string[];
}

interface RootRisk {
  id: string;
  title: string;
  severity: Severity;
  category: string;
  evidence: {
    file: string;
    line: number;
    column: number;
    snippets: string[];
  };
  controls: RootRiskControl[];
  signalCount: number;
}

interface FrameworkPosture {
  framework: Framework;
  score: number;
  findingCount: number;
  weightedRisk: number;
  criticalCount: number;
  highCount: number;
}

interface EngineeringPosture {
  score: number;
  frameworks: FrameworkPosture[];
  methodology: string;
  disclaimer: string;
}

interface IntelligencePayload {
  repositoryProfile: RepositoryProfile;
  rootRisks: RootRisk[];
  posture: EngineeringPosture;
}

interface ScanWithIntelligence {
  intelligence?: IntelligencePayload;
}

const frameworkLabels: Record<
  Framework,
  string
> = {
  gdpr: "GDPR",
  soc2: "SOC 2",
  iso27001: "ISO 27001",
};

const severityClasses: Record<
  Severity,
  string
> = {
  critical:
    "border-red-200 bg-red-50 text-red-700",
  high:
    "border-orange-200 bg-orange-50 text-orange-700",
  medium:
    "border-amber-200 bg-amber-50 text-amber-700",
  low:
    "border-blue-200 bg-blue-50 text-blue-700",
  info:
    "border-white/[0.065] bg-white/[0.02] text-white/55",
};

function scoreLabel(
  score: number,
): string {
  if (score >= 90) {
    return "Strong observed posture";
  }

  if (score >= 75) {
    return "Moderate observed posture";
  }

  if (score >= 50) {
    return "Elevated engineering risk";
  }

  return "Significant engineering risk";
}

export function IntelligenceSummary({
  data,
}: {
  data: unknown;
}) {
  const payload =
    (
      data as ScanWithIntelligence
    )?.intelligence;

  if (!payload) {
    return null;
  }

  const {
    repositoryProfile,
    rootRisks,
    posture,
  } = payload;

  const totalSignals =
    rootRisks.reduce(
      (total, risk) =>
        total +
        risk.signalCount,
      0,
    );

  const crossFrameworkRisks =
    rootRisks.filter(
      (risk) =>
        new Set(
          risk.controls.map(
            (control) =>
              control.framework,
          ),
        ).size > 1,
    ).length;

  return (
    <section className="mb-6 overflow-hidden rounded-[16px] border border-white/[0.065] bg-[#0b0b0f] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="border-b border-white/[0.055] bg-[#09090d] px-6 py-6 text-white md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
              <BrainCircuit className="h-4 w-4 text-[#a88cff]" />
              Repository intelligence
            </div>

            <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] md:text-xl">
              ComplyGuard understands what it scanned.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/30">
              Technology, risk surfaces, correlated root risks and observed engineering posture are derived from the repository and deterministic scan evidence.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-[7px] border border-white/[0.065] bg-white/[0.04] px-4 py-2 text-xs text-zinc-300">
            <Sparkles className="h-3.5 w-3.5 text-[#a88cff]" />
            Deep Review ready
          </div>
        </div>
      </div>

      <div className="grid border-b border-white/[0.055] md:grid-cols-2 xl:grid-cols-4">
        <Metric
          icon={
            <ShieldCheck className="h-4 w-4" />
          }
          label="Observed posture"
          value={`${posture.score}/100`}
          detail={scoreLabel(
            posture.score,
          )}
        />

        <Metric
          icon={
            <Radar className="h-4 w-4" />
          }
          label="Root risks"
          value={String(
            rootRisks.length,
          )}
          detail={`${totalSignals} raw scanner signal${totalSignals === 1 ? "" : "s"}`}
        />

        <Metric
          icon={
            <Layers3 className="h-4 w-4" />
          }
          label="Risk surfaces"
          value={String(
            repositoryProfile
              .riskSurfaces.length,
          )}
          detail="Repository derived"
        />

        <Metric
          icon={
            <GitBranch className="h-4 w-4" />
          }
          label="Cross framework"
          value={String(
            crossFrameworkRisks,
          )}
          detail="Correlated root risks"
          last
        />
      </div>

      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div className="border-b border-white/[0.055] p-6 md:p-6 lg:border-b-0 lg:border-r">
          <SectionTitle
            icon={
              <Database className="h-4 w-4" />
            }
            title="Repository profile"
            description={`${repositoryProfile.sourceFileCount} source files · ${repositoryProfile.primaryLanguage}`}
          />

          <div className="mt-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
              Detected technology
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {repositoryProfile
                .technologies.length >
              0 ? (
                repositoryProfile.technologies.map(
                  (
                    technology,
                    index,
                  ) => (
                    <div
                      key={`${technology.category}-${technology.name}-${index}`}
                      className="rounded-[7px] border border-white/[0.065] bg-white/[0.02] px-3 py-1.5"
                    >
                      <span className="text-xs font-semibold text-white/80">
                        {
                          technology.name
                        }
                      </span>

                      <span className="ml-2 text-[10px] uppercase tracking-wide text-white/30">
                        {
                          technology.category
                        }
                      </span>
                    </div>
                  ),
                )
              ) : (
                <p className="text-sm text-white/45">
                  No recognized framework dependencies were detected.
                </p>
              )}
            </div>
          </div>

          <div className="mt-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
              Observed risk surfaces
            </p>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {repositoryProfile
                .riskSurfaces.length >
              0 ? (
                repositoryProfile.riskSurfaces.map(
                  (surface) => (
                    <div
                      key={
                        surface.id
                      }
                      className="rounded-[10px] border border-white/[0.065] p-4"
                    >
                      <div className="flex items-center gap-2">
                        <Fingerprint className="h-4 w-4 text-[#a88cff]" />

                        <span className="text-sm font-semibold text-white">
                          {
                            surface.label
                          }
                        </span>
                      </div>

                      <p className="mt-2 text-xs leading-5 text-white/45">
                        {
                          surface
                            .reasons[0]
                        }
                      </p>
                    </div>
                  ),
                )
              ) : (
                <p className="text-sm text-white/45">
                  No additional risk surfaces were inferred from repository structure.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-6">
          <SectionTitle
            icon={
              <ShieldCheck className="h-4 w-4" />
            }
            title="Framework posture"
            description="Observed scanner evidence only"
          />

          <div className="mt-5 space-y-4">
            {posture.frameworks.map(
              (framework) => (
                <div
                  key={
                    framework.framework
                  }
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-white">
                        {
                          frameworkLabels[
                            framework
                              .framework
                          ]
                        }
                      </span>

                      <span className="ml-2 text-xs text-white/30">
                        {
                          framework.findingCount
                        }{" "}
                        signal
                        {framework.findingCount ===
                        1
                          ? ""
                          : "s"}
                      </span>
                    </div>

                    <span className="font-mono text-sm font-semibold text-white/80">
                      {
                        framework.score
                      }
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-[7px] bg-white/[0.06]">
                    <div
                      className="h-full rounded-[7px] bg-white/[0.04] transition-all duration-700"
                      style={{
                        width: `${framework.score}%`,
                      }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>

          <p className="mt-6 border-t border-white/[0.055] pt-5 text-xs leading-5 text-white/30">
            {posture.disclaimer}
          </p>
        </div>
      </div>

      {rootRisks.length > 0 && (
        <div className="border-t border-white/[0.055] p-6 md:p-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <SectionTitle
              icon={
                <Radar className="h-4 w-4" />
              }
              title="Correlated root risks"
              description="Duplicate framework signals grouped into underlying engineering problems"
            />

            <span className="text-xs text-white/30">
              Showing{" "}
              {Math.min(
                rootRisks.length,
                8,
              )}{" "}
              of{" "}
              {rootRisks.length}
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {rootRisks
              .slice(0, 8)
              .map((risk) => (
                <div
                  key={risk.id}
                  className="rounded-[10px] border border-white/[0.065] bg-white/[0.015] p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-[7px] border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${severityClasses[risk.severity]}`}
                        >
                          {
                            risk.severity
                          }
                        </span>

                        <span className="rounded-[7px] border border-white/[0.065] bg-[#0b0b0f] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/45">
                          {
                            risk.signalCount
                          }{" "}
                          signal
                          {risk.signalCount ===
                          1
                            ? ""
                            : "s"}
                        </span>
                      </div>

                      <h3 className="mt-3 text-base font-semibold text-white">
                        {
                          risk.title
                        }
                      </h3>

                      <p className="mt-2 break-all font-mono text-xs text-white/45">
                        {
                          risk.evidence
                            .file
                        }
                        :
                        {
                          risk.evidence
                            .line
                        }
                      </p>
                    </div>

                    <div className="flex max-w-xl flex-wrap gap-2">
                      {risk.controls.map(
                        (
                          control,
                          index,
                        ) => (
                          <div
                            key={`${control.framework}-${control.control}-${index}`}
                            className="rounded-[9px] border border-white/[0.065] bg-[#0b0b0f] px-3 py-2"
                          >
                            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                              {
                                frameworkLabels[
                                  control
                                    .framework
                                ]
                              }
                            </div>

                            <div className="mt-1 text-xs font-medium text-white/70">
                              {
                                control.control
                              }
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}

function Metric({
  icon,
  label,
  value,
  detail,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  last?: boolean;
}) {
  return (
    <div
      className={`p-6 md:p-7 ${
        last
          ? ""
          : "border-b border-white/[0.055] md:border-b-0 md:border-r"
      }`}
    >
      <div className="flex items-center gap-2 text-white/30">
        {icon}

        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>

      <div className="mt-4 text-xl font-semibold tracking-[-0.04em] text-white">
        {value}
      </div>

      <p className="mt-1 text-xs text-white/30">
        {detail}
      </p>
    </div>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-white">
        {icon}

        <h3 className="text-sm font-semibold">
          {title}
        </h3>
      </div>

      <p className="mt-1 text-xs text-white/30">
        {description}
      </p>
    </div>
  );
}

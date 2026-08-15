import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  FileCode2,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow absolute inset-0 -z-10" />

      <div className="mx-auto grid min-h-[760px] max-w-7xl items-center gap-16 px-6 py-24 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <Badge
            variant="outline"
            className="mb-7 rounded-full bg-background/80 px-4 py-2 backdrop-blur"
          >
            <ShieldCheck className="mr-2 size-4" />
            Continuous compliance engineering
          </Badge>

          <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Find compliance risk before your code ships.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
            ComplyGuard analyzes real source code and maps concrete engineering
            risks to GDPR, SOC 2, and ISO 27001 controls with exact evidence and
            actionable remediation.
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="/scan"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 rounded-xl px-6",
              )}
            >
              Scan a project
              <ArrowRight className="ml-2 size-4" />
            </Link>

            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "h-12 rounded-xl px-6",
              )}
            >
              Open dashboard
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-foreground" />
              Real AST analysis
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-foreground" />
              Exact file evidence
            </span>

            <span className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-foreground" />
              No external AI API
            </span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 -z-10 rounded-full bg-foreground/[0.04] blur-3xl" />

          <div className="overflow-hidden rounded-[28px] border bg-card/90 shadow-2xl shadow-foreground/10 backdrop-blur">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-muted-foreground/30" />
                <div className="size-2.5 rounded-full bg-muted-foreground/30" />
                <div className="size-2.5 rounded-full bg-muted-foreground/30" />
              </div>

              <span className="text-xs font-medium text-muted-foreground">
                Source analysis
              </span>
            </div>

            <div className="p-5">
              <div className="rounded-2xl border bg-muted/40 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Repository scanner</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      TypeScript AST inspection
                    </p>
                  </div>

                  <ScanSearch className="size-5" />
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 rounded-xl border bg-background p-4">
                    <FileCode2 className="size-5 text-muted-foreground" />

                    <div>
                      <p className="text-sm font-medium">
                        Inspect source structure
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Functions, calls, expressions, imports, routes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl border bg-background p-4">
                    <ShieldCheck className="size-5 text-muted-foreground" />

                    <div>
                      <p className="text-sm font-medium">
                        Map evidence to controls
                      </p>
                      <p className="text-xs text-muted-foreground">
                        GDPR, SOC 2, ISO 27001
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-foreground p-4 text-background">
                    <p className="text-sm font-medium">
                      Findings come only from actual scanner output.
                    </p>

                    <p className="mt-1 text-xs text-background/65">
                      No simulated findings. No fabricated compliance score.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                {["GDPR", "SOC 2", "ISO 27001"].map((framework) => (
                  <div
                    key={framework}
                    className="rounded-xl border px-3 py-4 text-center text-xs font-medium"
                  >
                    {framework}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

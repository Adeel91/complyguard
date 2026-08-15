import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RepositoryScanner } from "@/components/scanner/repository-scanner";

export default function ScanPage() {
  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-[#f5f5f3]">
        <section className="relative overflow-hidden border-b border-black/[0.06] bg-[#101112] text-white">
          <div className="cg-grid-dark absolute inset-0 opacity-35" />

          <div className="absolute left-[-100px] top-[-120px] size-[360px] rounded-full bg-[#ef3f46]/15 blur-[130px]" />

          <div className="relative mx-auto max-w-[1500px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-white/45">
                  <span className="size-1.5 rounded-full bg-[#ef3f46]" />
                  Repository analysis
                </div>

                <h1 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-5xl lg:text-6xl">
                  Inspect real source.
                  <span className="block text-white/30">
                    Trace every finding.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/38 sm:text-base">
                  Public GitHub repositories are
                  downloaded temporarily, parsed and
                  analyzed by the real ComplyGuard
                  rule engine.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  ["GDPR", "Privacy"],
                  ["SOC 2", "Trust"],
                  ["ISO", "Security"],
                ].map(([name, label]) => (
                  <div
                    key={name}
                    className="min-w-[90px] rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3 text-center"
                  >
                    <div className="text-xs font-bold">
                      {name}
                    </div>

                    <div className="mt-1 text-[8px] uppercase tracking-[0.1em] text-white/25">
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12 lg:py-12">
          <RepositoryScanner />
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

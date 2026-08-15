import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="bg-[#101112] text-white">
      <div className="mx-auto max-w-[1500px] px-5 py-14 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[10px] font-black">
                CG
              </div>

              <span className="text-base font-semibold tracking-[-0.035em]">
                ComplyGuard
              </span>
            </div>

            <p className="mt-5 max-w-xl text-sm leading-7 text-white/40">
              Deterministic source analysis for
              engineering patterns associated with
              GDPR, SOC 2 and ISO 27001 controls.
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs text-white/45">
            <Link
              href="/scan"
              className="transition hover:text-white"
            >
              Scanner
            </Link>

            <a
              href="https://github.com/Adeel91/complyguard"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-white"
            >
              GitHub
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-[10px] text-white/25 sm:flex-row sm:justify-between">
          <p>
            ComplyGuard does not certify regulatory
            compliance.
          </p>

          <p>
            Built with Kiro Specs, Steering and Hooks.
          </p>
        </div>
      </div>
    </footer>
  );
}

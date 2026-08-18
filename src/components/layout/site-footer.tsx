import Link from "next/link";

import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="pb-10 pt-16">
      <div className="cg-container">
        <div className="cg-fade-line" />

        <div className="grid gap-10 py-12 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Logo />

            <p className="mt-5 max-w-[560px] text-[11px] leading-6 text-white/25">
              Evidence first engineering analysis for source patterns associated with GDPR, SOC 2 and ISO 27001 controls.
            </p>
          </div>

          <div className="flex gap-7 text-[11px] text-white/30">
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

        <div className="flex flex-col gap-3 text-[9px] text-white/16 sm:flex-row sm:justify-between">
          <span>
            ComplyGuard does not certify compliance.
          </span>

          <span>
            Built with Kiro · deterministic evidence engine
          </span>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

import { EvidenceTopology } from "@/components/visual/evidence-topology";

function Arrow() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 10h11M11 6l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Hero() {
  return (
    <section className="border-b border-white/[0.08]">
      <div className="cg-container grid min-h-[700px] border-x border-white/[0.08] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex items-center px-8 py-20 md:px-14 lg:px-16">
          <div className="absolute inset-0 cg-grid opacity-20" />

          <div className="relative z-10 max-w-[650px]">
            <div className="cg-eyebrow">
              Evidence first compliance engineering
            </div>

            <h1 className="cg-display mt-8 text-[47px] text-white sm:text-[58px] xl:text-[68px]">
              Understand
              <br />
              the risk in
              <br />
              <span className="text-white/35">
                your code.
              </span>
            </h1>

            <p className="mt-8 max-w-[570px] text-[15px] leading-7 text-white/52">
              ComplyGuard traces real source evidence into engineering risks, correlates duplicate signals and maps their impact across GDPR, SOC 2 and ISO 27001.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/scan"
                className="cg-primary"
              >
                Scan a repository
                <Arrow />
              </Link>

              <a
                href="https://github.com/Adeel91/complyguard"
                target="_blank"
                rel="noreferrer"
                className="cg-secondary"
              >
                View source
              </a>
            </div>

            <div className="mt-14 flex max-w-[570px] items-center gap-8 border-t border-white/[0.08] pt-6 text-[12px] text-white/38">
              <span>
                TypeScript + JavaScript
              </span>

              <span className="h-1 w-1 rounded-full bg-white/20" />

              <span>
                18 deterministic rules
              </span>

              <span className="h-1 w-1 rounded-full bg-white/20" />

              <span>
                3 frameworks
              </span>
            </div>
          </div>
        </div>

        <EvidenceTopology />
      </div>
    </section>
  );
}

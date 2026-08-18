import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RepositoryScanner } from "@/components/scanner/repository-scanner";

const scope = [
  {
    label: "Repository",
    value: "Public GitHub",
  },
  {
    label: "Source",
    value: "TS · TSX · JS · JSX",
  },
  {
    label: "Hosted archive",
    value: "Up to 25 MB",
  },
];

export default function ScanPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden pb-12 pt-32 md:pb-16 md:pt-40">
        <div className="pointer-events-none absolute right-[-80px] top-[80px] h-[500px] w-[700px] rounded-full bg-[#8e6de5]/[0.055] blur-[130px]" />

        <div className="cg-container relative">
          <div className="grid gap-14 lg:grid-cols-[1fr_370px] lg:items-end">
            <div>
              <div className="cg-eyebrow">
                Repository analysis
              </div>

              <h1 className="cg-display mt-7 max-w-[900px] text-[48px] text-white md:text-[66px]">
                Analyze the code.
                <br />

                <span className="text-white/27">
                  Inspect the evidence.
                </span>
              </h1>

              <p className="mt-7 max-w-[790px] text-[14px] leading-7 text-white/44">
                ComplyGuard runs deterministic source analysis against a real
                repository, profiles its engineering surface, correlates repeated
                framework signals into root risks and traces every finding back
                to its source location.
              </p>

              <p className="mt-4 max-w-[760px] text-[11px] leading-6 text-white/25">
                Control mappings identify engineering signals associated with
                GDPR, SOC 2 and ISO 27001. They are not legal conclusions,
                audit opinions or compliance certification.
              </p>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.1em] text-white/24">
                Hosted scanner scope
              </div>

              <div className="mt-5">
                {scope.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-baseline justify-between border-t border-white/[0.07] py-4"
                  >
                    <span className="text-[11px] text-white/30">
                      {item.label}
                    </span>

                    <span className="text-[12px] font-semibold text-white/66">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-3 text-[10px] leading-5 text-white/22">
                The 25 MB limit applies to the downloaded GitHub repository
                archive used by the hosted scanner.
              </p>
            </div>
          </div>
        </div>
      </section>

      <RepositoryScanner />

      <SiteFooter />
    </main>
  );
}

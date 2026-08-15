import Link from "next/link";

const codeLines = [
  {
    left: "const",
    middle: " sessionToken ",
    right: "= Math.random().toString(36);",
    risk: true,
  },
  {
    left: "console",
    middle: ".log(user.email);",
    right: "",
    risk: true,
  },
  {
    left: "fetch",
    middle: '("http://api.example.com",',
    right: " { body });",
    risk: true,
  },
  {
    left: "const",
    middle: " userId ",
    right: "= request.user.id;",
    risk: false,
  },
  {
    left: "await",
    middle: " auditLog",
    right: "({ actor, action });",
    risk: false,
  },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-black/[0.06] bg-[#f5f5f3]">
      <div className="cg-grid absolute inset-0" />

      <div className="absolute left-[-80px] top-[-120px] size-[380px] rounded-full bg-[#ef3f46]/[0.10] blur-[120px]" />
      <div className="absolute right-[5%] top-10 size-[300px] rounded-full bg-black/[0.04] blur-[110px]" />

      <div className="relative mx-auto grid max-w-[1500px] gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-12 lg:py-24">
        <div className="max-w-[650px]">
          <div className="cg-fade-up inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-black/50 shadow-sm backdrop-blur">
            <span className="size-1.5 rounded-full bg-[#ef3f46]" />
            Static analysis
            <span className="text-black/20">
              /
            </span>
            Real evidence
          </div>

          <h1 className="cg-fade-up-1 mt-7 text-[48px] font-semibold leading-[0.96] tracking-[-0.065em] sm:text-[62px] lg:text-[68px]">
            See compliance
            risk where it
            actually starts.
          </h1>

          <p className="cg-fade-up-2 mt-7 max-w-xl text-base leading-8 text-black/50 sm:text-lg">
            ComplyGuard inspects real JavaScript and
            TypeScript source code, finds concrete
            engineering risk patterns, and maps them
            to GDPR, SOC 2 and ISO 27001 controls.
          </p>

          <div className="cg-fade-up-3 mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/scan"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#ef3f46] px-6 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(239,63,70,0.22)] transition hover:bg-[#d93239]"
            >
              Scan a repository
              <span className="ml-2">
                →
              </span>
            </Link>

            <a
              href="https://github.com/Adeel91/complyguard"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-black/10 bg-white/80 px-6 text-sm font-semibold text-black/65 transition hover:border-black/20 hover:text-black"
            >
              Explore source
            </a>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            {[
              ["AST", "Real source analysis"],
              ["18", "Active deterministic rules"],
              ["3", "Mapped frameworks"],
            ].map(([value, label]) => (
              <div
                key={label}
                className="border-l border-black/[0.08] pl-4 first:border-l-0 first:pl-0"
              >
                <div className="text-xl font-semibold tracking-[-0.045em]">
                  {value}
                </div>

                <div className="mt-1 max-w-[120px] text-[10px] leading-4 text-black/35">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[760px]">
          <div className="cg-shadow-lg relative overflow-hidden rounded-[28px] border border-black/10 bg-[#0e0f10]">
            <div className="flex h-14 items-center justify-between border-b border-white/[0.08] px-5">
              <div className="flex items-center gap-2">
                <span className="size-2.5 rounded-full bg-white/10" />
                <span className="size-2.5 rounded-full bg-white/10" />
                <span className="size-2.5 rounded-full bg-white/10" />
              </div>

              <div className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[9px] text-white/30">
                source-analysis.ts
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div className="cg-grid-dark absolute inset-0 opacity-30" />
              <div className="cg-scan-beam" />

              <div className="relative p-5 sm:p-7">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/25">
                      Analysis engine
                    </div>

                    <div className="mt-2 text-sm font-semibold text-white/85">
                      Parse source → evaluate context → map control
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-300/80">
                      deterministic
                    </span>
                  </div>
                </div>

                <div className="mt-7 overflow-hidden rounded-[20px] border border-white/[0.08] bg-black/25">
                  <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                    <span className="font-mono text-[9px] text-white/30">
                      src/auth/session.ts
                    </span>

                    <span className="text-[9px] font-semibold text-white/20">
                      AST
                    </span>
                  </div>

                  <div className="space-y-1 p-3">
                    {codeLines.map((line, index) => (
                      <div
                        key={`${line.middle}-${index}`}
                        className={[
                          "grid grid-cols-[30px_1fr] rounded-xl px-3 py-2.5 font-mono text-[11px] leading-5 transition",
                          line.risk
                            ? "bg-[#ef3f46]/[0.065]"
                            : "bg-transparent",
                        ].join(" ")}
                      >
                        <span className="text-white/15">
                          {index + 11}
                        </span>

                        <div className="min-w-0">
                          <span className="text-[#ff747a]">
                            {line.left}
                          </span>

                          <span className="text-white/75">
                            {line.middle}
                          </span>

                          <span className="text-white/40">
                            {line.right}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      title: "Source",
                      value: "Parsed",
                      sub: "Real AST nodes",
                    },
                    {
                      title: "Context",
                      value: "Evaluated",
                      sub: "Rule conditions",
                    },
                    {
                      title: "Evidence",
                      value: "Attached",
                      sub: "File + line + fix",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4"
                    >
                      <div className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/20">
                        {item.title}
                      </div>

                      <div className="mt-2 text-sm font-semibold text-white/80">
                        {item.value}
                      </div>

                      <div className="mt-1 text-[9px] text-white/25">
                        {item.sub}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="cg-float absolute -left-6 bottom-16 hidden w-[180px] rounded-2xl border border-black/10 bg-white p-4 shadow-xl xl:block">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-black/30">
              Framework mapping
            </div>

            <div className="mt-3 space-y-2.5">
              {[
                "GDPR Article 32",
                "SOC 2 CC6.7",
                "ISO 27001 A.8",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 text-[10px] font-semibold text-black/60"
                >
                  <span className="size-1.5 rounded-full bg-[#ef3f46]" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="cg-float-delay absolute -right-5 top-20 hidden w-[160px] rounded-2xl border border-black/10 bg-white p-4 shadow-xl xl:block">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-black/30">
              Output
            </div>

            <div className="mt-3 flex gap-2">
              <span className="rounded-lg bg-black/[0.04] px-2.5 py-2 text-[10px] font-semibold">
                JSON
              </span>

              <span className="rounded-lg bg-black/[0.04] px-2.5 py-2 text-[10px] font-semibold">
                SARIF
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

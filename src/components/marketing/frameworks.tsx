const frameworks = [
  {
    name: "GDPR",
    subtitle:
      "Privacy engineering",
    controls:
      "Article 5 · Article 32",
    color:
      "#82dfcf",
  },
  {
    name: "SOC 2",
    subtitle:
      "Trust services",
    controls:
      "CC6 · CC7",
    color:
      "#79adff",
  },
  {
    name: "ISO 27001",
    subtitle:
      "Security controls",
    controls:
      "A.8",
    color:
      "#a992ff",
  },
];

export function Frameworks() {
  return (
    <section
      id="mapping"
      className="border-b border-white/[0.08] bg-[#0c0b0f]"
    >
      <div className="cg-container border-x border-white/[0.08]">
        <div className="px-8 py-16 md:px-14">
          <div className="cg-eyebrow">
            Cross framework mapping
          </div>

          <div className="mt-7 grid gap-8 lg:grid-cols-[0.58fr_0.42fr] lg:items-end">
            <h2 className="cg-heading max-w-[730px] text-[38px] text-white md:text-[48px]">
              One root risk.
              <br />
              <span className="text-white/30">
                Multiple consequences.
              </span>
            </h2>

            <p className="max-w-[530px] text-[14px] leading-7 text-white/43">
              ComplyGuard keeps the underlying engineering problem intact while showing every relevant framework relationship.
            </p>
          </div>
        </div>

        <div className="grid border-t border-white/[0.08] lg:grid-cols-3">
          {frameworks.map(
            (
              framework,
              index,
            ) => (
              <article
                key={framework.name}
                className={`relative min-h-[320px] px-8 py-10 md:px-12 ${
                  index !==
                  frameworks.length - 1
                    ? "border-b border-white/[0.08] lg:border-b-0 lg:border-r"
                    : ""
                }`}
              >
                <div
                  className="absolute left-0 top-0 h-[3px] w-full"
                  style={{
                    background:
                      framework.color,
                  }}
                />

                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/25">
                    0{index + 1}
                  </span>

                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background:
                        framework.color,
                      boxShadow:
                        `0 0 12px ${framework.color}`,
                    }}
                  />
                </div>

                <h3 className="cg-heading mt-16 text-[32px] text-white">
                  {framework.name}
                </h3>

                <p className="mt-3 text-[13px] text-white/38">
                  {framework.subtitle}
                </p>

                <div className="mt-16 border-t border-white/[0.08] pt-5">
                  <div className="text-[11px] uppercase tracking-[0.08em] text-white/28">
                    Relevant controls
                  </div>

                  <div className="mt-3 text-[14px] text-white/67">
                    {framework.controls}
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

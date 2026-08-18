const rows = [
  {
    number: "01",
    label: "PROFILE",
    title:
      "Understand the repository before judging it.",
    copy:
      "Dependencies, application structure and security sensitive source areas establish the context around every scan.",
    output:
      "repository.profile",
  },
  {
    number: "02",
    label: "INSPECT",
    title:
      "Find evidence in actual program structure.",
    copy:
      "AST rules operate on real source syntax and preserve exact file, line, column and triggering expression.",
    output:
      "evidence[]",
  },
  {
    number: "03",
    label: "CORRELATE",
    title:
      "Turn repeated signals into root risks.",
    copy:
      "A single insecure HTTP call should not pretend to be three unrelated vulnerabilities simply because three frameworks care about it.",
    output:
      "rootRisks[]",
  },
  {
    number: "04",
    label: "MAP",
    title:
      "Show exactly which controls are affected.",
    copy:
      "Each root risk retains its evidence while mapping into the relevant GDPR, SOC 2 and ISO 27001 engineering controls.",
    output:
      "controls[]",
  },
];

export function Capabilities() {
  return (
    <section
      id="engine"
      className="border-b border-white/[0.08]"
    >
      <div className="cg-container border-x border-white/[0.08]">
        <div className="grid border-b border-white/[0.08] lg:grid-cols-[0.42fr_0.58fr]">
          <div className="px-8 py-16 md:px-14">
            <div className="cg-eyebrow">
              Engine
            </div>

            <h2 className="cg-heading mt-7 max-w-[500px] text-[38px] text-white md:text-[48px]">
              Facts first.
              <br />
              <span className="text-white/30">
                Reasoning second.
              </span>
            </h2>
          </div>

          <div className="flex items-end border-t border-white/[0.08] px-8 py-16 lg:border-l lg:border-t-0 md:px-14">
            <p className="max-w-[650px] text-[15px] leading-7 text-white/47">
              The product starts from inspectable source evidence instead of asking a model to guess whether a repository looks compliant.
            </p>
          </div>
        </div>

        {rows.map(
          (
            row,
            index,
          ) => (
            <article
              key={row.number}
              className={`grid gap-7 px-8 py-10 md:grid-cols-[70px_140px_1fr_190px] md:items-center md:px-14 ${
                index !==
                rows.length - 1
                  ? "border-b border-white/[0.08]"
                  : ""
              }`}
            >
              <span className="text-[13px] text-white/25">
                {row.number}
              </span>

              <span className="text-[12px] font-semibold tracking-[0.08em] text-[#a992ff]">
                {row.label}
              </span>

              <div>
                <h3 className="text-[18px] font-semibold leading-6 text-white/88">
                  {row.title}
                </h3>

                <p className="mt-3 max-w-[690px] text-[13px] leading-6 text-white/43">
                  {row.copy}
                </p>
              </div>

              <code className="text-[12px] text-[#82dfcf]/70">
                → {row.output}
              </code>
            </article>
          ),
        )}
      </div>
    </section>
  );
}

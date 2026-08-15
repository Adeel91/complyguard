const capabilities = [
  {
    title: "Real AST analysis",
    description:
      "Source files are parsed into syntax trees. Findings come from actual code structure, not hardcoded demo data.",
    metric: "TS / TSX / JS / JSX",
  },
  {
    title: "Exact evidence",
    description:
      "Every result includes file, line, column, rule, severity, mapped control and remediation guidance.",
    metric: "Source attached",
  },
  {
    title: "Multiple outputs",
    description:
      "Use the interactive web report or export structured results for other engineering workflows.",
    metric: "JSON + SARIF",
  },
  {
    title: "One scanner core",
    description:
      "The CLI and web application both execute the same deterministic rule engine.",
    metric: "CLI + Web",
  },
];

export function Capabilities() {
  return (
    <section
      id="product"
      className="border-b border-black/[0.06] bg-[#f5f5f3]"
    >
      <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ef3f46]">
              Product
            </p>

            <h2 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.02] tracking-[-0.055em]">
              Built like an engineering tool,
              not a compliance landing page.
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-black/40">
            Deterministic first. Transparent by
            default. Every result can be traced back
            to the source that produced it.
          </p>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {capabilities.map((item) => (
            <div
              key={item.title}
              className="group min-h-[250px] rounded-[24px] border border-black/[0.07] bg-white p-6 transition hover:-translate-y-1 hover:border-black/15 hover:shadow-[0_18px_50px_rgba(13,14,15,0.06)]"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-[#111214]">
                <div className="size-2 rounded-full bg-[#ef3f46]" />
              </div>

              <h3 className="mt-10 text-lg font-semibold tracking-[-0.035em]">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-black/42">
                {item.description}
              </p>

              <div className="mt-8 border-t border-black/[0.06] pt-4 text-[9px] font-bold uppercase tracking-[0.12em] text-black/30">
                {item.metric}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    number: "01",
    title: "Repository",
    value:
      "github.com/org/project",
  },
  {
    number: "02",
    title: "Profile",
    value:
      "technology + risk surfaces",
  },
  {
    number: "03",
    title: "Evidence",
    value:
      "AST + source locations",
  },
  {
    number: "04",
    title: "Correlation",
    value:
      "signals → root risks",
  },
  {
    number: "05",
    title: "Mapping",
    value:
      "risks → controls",
  },
];

export function Workflow() {
  return (
    <section
      id="pipeline"
      className="border-b border-white/[0.08]"
    >
      <div className="cg-container border-x border-white/[0.08] px-8 py-20 md:px-14">
        <div className="cg-eyebrow">
          Execution pipeline
        </div>

        <h2 className="cg-heading mt-7 max-w-[780px] text-[38px] text-white md:text-[48px]">
          Nothing disappears
          <span className="text-white/30">
            {" "}
            between source and report.
          </span>
        </h2>

        <div className="mt-14 border border-white/[0.09] bg-[#0c0b0f]">
          <div className="flex h-11 items-center gap-2 border-b border-white/[0.08] px-5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/[0.07]" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/[0.05]" />

            <span className="ml-3 text-[11px] text-white/25">
              complyguard.pipeline
            </span>
          </div>

          {steps.map(
            (
              step,
              index,
            ) => (
              <div
                key={step.number}
                className={`grid min-h-[86px] gap-4 px-6 py-6 md:grid-cols-[80px_220px_1fr_auto] md:items-center ${
                  index !==
                  steps.length - 1
                    ? "border-b border-white/[0.07]"
                    : ""
                }`}
              >
                <span className="text-[12px] text-white/23">
                  {step.number}
                </span>

                <span className="text-[14px] font-semibold text-[#a992ff]">
                  {step.title}
                </span>

                <code className="text-[13px] text-white/54">
                  {step.value}
                </code>

                <span className="hidden text-[12px] text-[#82dfcf]/55 md:block">
                  pass →
                </span>
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

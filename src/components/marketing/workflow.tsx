const steps = [
  {
    number: "01",
    title: "Repository",
    description:
      "Provide a public GitHub URL or run the local CLI against a project directory.",
  },
  {
    number: "02",
    title: "Source graph",
    description:
      "ComplyGuard parses JavaScript and TypeScript into a real AST representation.",
  },
  {
    number: "03",
    title: "Rule execution",
    description:
      "Framework specific rules evaluate concrete source patterns and contextual conditions.",
  },
  {
    number: "04",
    title: "Evidence",
    description:
      "Findings return exact source locations, control mappings and actionable remediation.",
  },
];

export function Workflow() {
  return (
    <section
      id="workflow"
      className="relative overflow-hidden bg-[#101112] text-white"
    >
      <div className="cg-grid-dark absolute inset-0 opacity-40" />

      <div className="absolute right-[-160px] top-[-160px] size-[500px] rounded-full bg-[#ef3f46]/10 blur-[150px]" />

      <div className="relative mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff767c]">
              Pipeline
            </p>

            <h2 className="mt-4 text-4xl font-semibold leading-[1.02] tracking-[-0.055em]">
              Source in.
              Evidence out.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/35">
              No generated compliance theatre.
              Every stage is inspectable and based on
              the repository being analyzed.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.08] md:grid-cols-2">
            {steps.map((step) => (
              <div
                key={step.number}
                className="min-h-[220px] bg-[#101112] p-6 transition hover:bg-[#161719]"
              >
                <div className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/20">
                  {step.number}
                </div>

                <h3 className="mt-12 text-lg font-semibold tracking-[-0.035em]">
                  {step.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-white/35">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

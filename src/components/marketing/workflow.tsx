const steps = [
  {
    number: "01",
    title: "Load the source",
    description:
      "ComplyGuard reads the actual project and constructs a TypeScript syntax tree.",
  },
  {
    number: "02",
    title: "Run rule packs",
    description:
      "Framework specific analyzers inspect concrete program structures and security relevant patterns.",
  },
  {
    number: "03",
    title: "Collect evidence",
    description:
      "Every finding includes the rule, source file, line, severity, explanation, and remediation.",
  },
  {
    number: "04",
    title: "Verify the fix",
    description:
      "Run the scanner again after remediation and verify that the underlying finding disappears.",
  },
];

export function Workflow() {
  return (
    <section id="workflow">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Analysis workflow
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
            Evidence instead of compliance theater.
          </h2>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border bg-border lg:grid-cols-4">
          {steps.map((step) => (
            <article key={step.number} className="bg-background p-7">
              <span className="text-sm font-medium text-muted-foreground">
                {step.number}
              </span>

              <h3 className="mt-12 text-xl font-semibold">{step.title}</h3>

              <p className="mt-3 leading-7 text-muted-foreground">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

const items = [
  {
    id: "GDPR",
    title: "Privacy engineering",
    text:
      "Inspect source patterns related to personal data exposure, transport security, logging, credentials and secure processing.",
    controls: "Articles 5 · 25 · 32",
  },
  {
    id: "SOC 2",
    title: "Trust controls",
    text:
      "Identify implementation patterns around access control, secrets, auditability, communication security and operational logging.",
    controls: "CC6 · CC7",
  },
  {
    id: "ISO 27001",
    title: "Information security",
    text:
      "Map technical findings to secure coding, cryptography, logging, privileged operations and network protection controls.",
    controls: "ISO 27001:2022 · A.8",
  },
];

export function Frameworks() {
  return (
    <section
      id="frameworks"
      className="border-b border-black/[0.06] bg-white"
    >
      <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ef3f46]">
              Control mapping
            </p>

            <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-[1.02] tracking-[-0.055em]">
              Engineering evidence,
              not a fake compliance score.
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-black/45">
              ComplyGuard does not declare that an
              organization is compliant. It surfaces
              concrete technical signals that
              developers can inspect and fix.
            </p>
          </div>

          <div className="grid gap-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="group grid gap-5 rounded-[22px] border border-black/[0.07] bg-[#f7f7f5] p-5 transition hover:border-black/15 hover:bg-white sm:grid-cols-[70px_1fr_auto] sm:items-start sm:p-6"
              >
                <div className="text-[10px] font-semibold text-black/25">
                  0{index + 1}
                </div>

                <div>
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="text-lg font-semibold tracking-[-0.035em]">
                      {item.id}
                    </h3>

                    <span className="text-xs text-black/35">
                      {item.title}
                    </span>
                  </div>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-black/45">
                    {item.text}
                  </p>
                </div>

                <div className="rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[9px] font-semibold text-black/40">
                  {item.controls}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

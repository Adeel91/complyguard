import {
  DatabaseZap,
  Fingerprint,
  LockKeyhole,
} from "lucide-react";

import { FrameworkCard } from "@/components/marketing/framework-card";

const frameworks = [
  {
    name: "GDPR",
    description:
      "Detect engineering patterns related to unnecessary personal data exposure, logging, retention, access, and data handling.",
    icon: Fingerprint,
  },
  {
    name: "SOC 2",
    description:
      "Identify source level risks connected to access control, secrets, auditability, security configuration, and operational controls.",
    icon: LockKeyhole,
  },
  {
    name: "ISO 27001",
    description:
      "Map technical findings to information security controls covering access, secure development, logging, cryptography, and configuration.",
    icon: DatabaseZap,
  },
];

export function Frameworks() {
  return (
    <section id="frameworks" className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Compliance rule packs
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
            One scanner. Multiple control frameworks.
          </h2>

          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Every framework is implemented as an independent rule pack on top
            of the same static analysis engine.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {frameworks.map((framework) => (
            <FrameworkCard key={framework.name} {...framework} />
          ))}
        </div>
      </div>
    </section>
  );
}

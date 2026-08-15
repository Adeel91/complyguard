import { SiteHeader } from "@/components/layout/site-header";
import { SourceCard } from "@/components/scanner/source-card";

export default function ScanPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Scanner
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
            Analyze a real project.
          </h1>

          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Project ingestion and compliance analysis will use the same scanner
            engine exposed through the CLI.
          </p>
        </div>

        <div className="mt-10">
          <SourceCard />
        </div>
      </main>
    </>
  );
}

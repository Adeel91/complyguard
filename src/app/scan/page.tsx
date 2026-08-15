import { SiteHeader } from "@/components/layout/site-header";
import { RepositoryScanner } from "@/components/scanner/repository-scanner";

export default function ScanPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Repository scanner
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            Scan real source code.
          </h1>

          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Enter a public GitHub repository and run the actual ComplyGuard scanner.
          </p>
        </div>

        <div className="mt-10">
          <RepositoryScanner />
        </div>
      </main>
    </>
  );
}

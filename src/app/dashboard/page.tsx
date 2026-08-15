import { ShieldCheck } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <>
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Dashboard
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em]">
            Compliance findings
          </h1>

          <p className="mt-4 text-muted-foreground">
            Real scanner findings will appear here after a project has been
            analyzed.
          </p>
        </div>

        <Card className="mt-10 rounded-3xl border-dashed shadow-none">
          <CardContent className="flex min-h-72 flex-col items-center justify-center p-10 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
              <ShieldCheck className="size-6" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              No scan results yet
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              This dashboard intentionally contains no sample findings. Results
              will be rendered only from the real scanner engine.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}

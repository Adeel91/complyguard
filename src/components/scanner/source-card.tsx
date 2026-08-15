import { FolderCode } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SourceCard() {
  return (
    <Card className="rounded-3xl shadow-none">
      <CardHeader>
        <CardTitle>Project source</CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border p-5">
          <div className="flex size-6 items-center justify-center rounded-md border text-[10px] font-bold">GH</div>
          <h3 className="mt-5 font-semibold">Public GitHub repository</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Repository ingestion will clone and analyze the real project source.
          </p>
        </div>

        <div className="rounded-2xl border p-5">
          <FolderCode className="size-6" />
          <h3 className="mt-5 font-semibold">Local CLI</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Run the same scanner engine directly against a local project.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

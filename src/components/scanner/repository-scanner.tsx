"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  LoaderCircle,
  ScanSearch,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  ComplianceFinding,
  ComplianceFramework,
} from "@/scanner/types/finding";

type WebFinding = Omit<ComplianceFinding, "location"> & {
  location: {
    file: string;
    line: number;
    column: number;
  };
};

type ScanResponse = {
  repository: {
    owner: string;
    name: string;
    branch: string;
    url: string;
  };
  frameworks: ComplianceFramework[];
  sourceFileCount: number;
  ruleCount: number;
  findingCount: number;
  findings: WebFinding[];
  sarif: unknown;
};

const FRAMEWORKS: Array<{
  id: ComplianceFramework;
  label: string;
}> = [
  { id: "gdpr", label: "GDPR" },
  { id: "soc2", label: "SOC 2" },
  { id: "iso27001", label: "ISO 27001" },
];

function downloadJson(filename: string, value: unknown) {
  const blob = new Blob(
    [JSON.stringify(value, null, 2)],
    {
      type: "application/json",
    },
  );

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = filename;
  anchor.click();

  URL.revokeObjectURL(url);
}

export function RepositoryScanner() {
  const [repositoryUrl, setRepositoryUrl] = useState("");
  const [frameworks, setFrameworks] = useState<
    ComplianceFramework[]
  >(["gdpr", "soc2", "iso27001"]);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleFramework(framework: ComplianceFramework) {
    setFrameworks((current) => {
      if (current.includes(framework)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((item) => item !== framework);
      }

      return [...current, framework];
    });
  }

  async function runScan() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repositoryUrl,
          frameworks,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Scan failed.");
      }

      setResult(payload as ScanResponse);
    } catch (scanError) {
      setError(
        scanError instanceof Error
          ? scanError.message
          : "Scan failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <Card className="rounded-3xl shadow-none">
        <CardHeader>
          <CardTitle>Public GitHub repository</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <Input
            value={repositoryUrl}
            onChange={(event) =>
              setRepositoryUrl(event.target.value)
            }
            placeholder="https://github.com/owner/repository"
            className="h-12 rounded-xl"
          />

          <div className="flex flex-wrap gap-3">
            {FRAMEWORKS.map((framework) => (
              <label
                key={framework.id}
                className="flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-sm"
              >
                <input
                  type="checkbox"
                  checked={frameworks.includes(framework.id)}
                  onChange={() =>
                    toggleFramework(framework.id)
                  }
                />

                {framework.label}
              </label>
            ))}
          </div>

          <Button
            onClick={runScan}
            disabled={
              loading ||
              repositoryUrl.trim().length === 0
            }
            className="h-12 rounded-xl px-6"
          >
            {loading ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                Scanning repository
              </>
            ) : (
              <>
                <ScanSearch className="size-4" />
                Run compliance scan
              </>
            )}
          </Button>

          {error ? (
            <div className="rounded-xl border p-4 text-sm text-destructive">
              {error}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {result ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-2xl shadow-none">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Source files
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {result.sourceFileCount}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-none">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Rules executed
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {result.ruleCount}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-none">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">
                  Findings
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {result.findingCount}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl shadow-none">
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">
                  {result.repository.owner}/{result.repository.name}
                </p>

                <p className="mt-1 text-sm text-muted-foreground">
                  Branch: {result.repository.branch}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    downloadJson(
                      "complyguard-report.json",
                      result,
                    )
                  }
                >
                  <Download className="size-4" />
                  JSON
                </Button>

                <Button
                  variant="outline"
                  onClick={() =>
                    downloadJson(
                      "complyguard-report.sarif",
                      result.sarif,
                    )
                  }
                >
                  <Download className="size-4" />
                  SARIF
                </Button>
              </div>
            </CardContent>
          </Card>

          {result.findings.length === 0 ? (
            <Card className="rounded-3xl border-dashed shadow-none">
              <CardContent className="flex min-h-52 flex-col items-center justify-center text-center">
                <CheckCircle2 className="size-8" />

                <h2 className="mt-4 text-xl font-semibold">
                  No findings detected
                </h2>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {result.findings.map((finding, index) => (
                <Card
                  key={`${finding.ruleId}-${finding.location.file}-${finding.location.line}-${index}`}
                  className="rounded-3xl shadow-none"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <AlertTriangle className="size-5" />

                      <Badge variant="outline">
                        {finding.ruleId}
                      </Badge>

                      <Badge variant="secondary">
                        {finding.framework.toUpperCase()}
                      </Badge>

                      <Badge variant="outline">
                        {finding.severity.toUpperCase()}
                      </Badge>
                    </div>

                    <h3 className="mt-4 text-lg font-semibold">
                      {finding.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {finding.description}
                    </p>

                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <div className="rounded-2xl bg-muted/50 p-4">
                        <p className="text-sm font-medium">
                          {finding.location.file}:
                          {finding.location.line}:
                          {finding.location.column}
                        </p>

                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl border bg-background p-4 text-xs">
                          {finding.evidence}
                        </pre>
                      </div>

                      <div className="rounded-2xl border p-4">
                        <p className="text-sm font-semibold">
                          {finding.control}
                        </p>

                        <p className="mt-4 text-sm leading-6">
                          {finding.remediation}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

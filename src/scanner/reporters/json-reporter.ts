import type { ScanResult } from "@/scanner/core/scanner";

export function createJsonReport(result: ScanResult): string {
  return JSON.stringify(result, null, 2);
}

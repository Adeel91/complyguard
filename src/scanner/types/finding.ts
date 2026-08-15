export type ComplianceFramework = "gdpr" | "soc2" | "iso27001";

export type FindingSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "info";

export interface SourceLocation {
  file: string;
  line: number;
  column: number;
}

export interface ComplianceFinding {
  ruleId: string;
  framework: ComplianceFramework;
  control: string;
  severity: FindingSeverity;
  title: string;
  description: string;
  evidence: string;
  remediation: string;
  location: SourceLocation;
}

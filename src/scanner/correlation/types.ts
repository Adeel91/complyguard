import type {
  ComplianceFinding,
  ComplianceFramework,
  FindingSeverity,
} from "@/scanner/types/finding";

export interface RootRiskControl {
  framework: ComplianceFramework;
  control: string;
  ruleIds: string[];
}

export interface RootRisk {
  id: string;
  title: string;
  severity: FindingSeverity;
  category:
    | "authentication"
    | "transport"
    | "logging"
    | "secrets"
    | "cryptography"
    | "audit"
    | "code-execution"
    | "other";
  evidence: {
    file: string;
    line: number;
    column: number;
    snippets: string[];
  };
  controls: RootRiskControl[];
  rawFindings: ComplianceFinding[];
  signalCount: number;
}

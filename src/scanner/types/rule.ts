import type { SourceFile } from "ts-morph";

import type {
  ComplianceFinding,
  ComplianceFramework,
} from "@/scanner/types/finding";

export interface ComplianceRule {
  id: string;
  framework: ComplianceFramework;
  control: string;
  title: string;

  analyze(sourceFile: SourceFile): ComplianceFinding[];
}

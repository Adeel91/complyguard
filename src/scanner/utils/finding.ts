import type { Node } from "ts-morph";

import type {
  ComplianceFinding,
  ComplianceFramework,
  FindingSeverity,
} from "@/scanner/types/finding";
import { getNodeLocation } from "@/scanner/utils/location";

type CreateFindingInput = {
  node: Node;
  ruleId: string;
  framework: ComplianceFramework;
  control: string;
  severity: FindingSeverity;
  title: string;
  description: string;
  evidence?: string;
  remediation: string;
};

export function createFinding({
  node,
  ruleId,
  framework,
  control,
  severity,
  title,
  description,
  evidence,
  remediation,
}: CreateFindingInput): ComplianceFinding {
  return {
    ruleId,
    framework,
    control,
    severity,
    title,
    description,
    evidence: evidence ?? node.getText(),
    remediation,
    location: getNodeLocation(node),
  };
}

import { gdprRules } from "@/scanner/rules/gdpr";
import { iso27001Rules } from "@/scanner/rules/iso27001";
import { soc2Rules } from "@/scanner/rules/soc2";
import type { ComplianceFramework } from "@/scanner/types/finding";
import type { ComplianceRule } from "@/scanner/types/rule";

const RULE_PACKS: Record<ComplianceFramework, ComplianceRule[]> = {
  gdpr: gdprRules,
  soc2: soc2Rules,
  iso27001: iso27001Rules,
};

export function getRulesForFrameworks(
  frameworks: ComplianceFramework[],
): ComplianceRule[] {
  return frameworks.flatMap((framework) => RULE_PACKS[framework]);
}

import { gdprRules } from "@/scanner/rules/gdpr";
import { iso27001Rules } from "@/scanner/rules/iso27001";
import { soc2Rules } from "@/scanner/rules/soc2";

export const complianceRules = [
  ...gdprRules,
  ...soc2Rules,
  ...iso27001Rules,
];

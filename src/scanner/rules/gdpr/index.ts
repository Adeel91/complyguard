import type { ComplianceRule } from "@/scanner/types/rule";

import { hardcodedSensitiveValueRule } from "@/scanner/rules/gdpr/hardcoded-sensitive-value";
import { httpPersonalDataRule } from "@/scanner/rules/gdpr/http-personal-data";
import { insecurePasswordComparisonRule } from "@/scanner/rules/gdpr/insecure-password-comparison";
import { insecureRandomTokenRule } from "@/scanner/rules/gdpr/insecure-random-token";
import { sensitiveConsoleLogRule } from "@/scanner/rules/gdpr/sensitive-console-log";

export const gdprRules: ComplianceRule[] = [
  sensitiveConsoleLogRule,
  hardcodedSensitiveValueRule,
  insecurePasswordComparisonRule,
  insecureRandomTokenRule,
  httpPersonalDataRule,
];

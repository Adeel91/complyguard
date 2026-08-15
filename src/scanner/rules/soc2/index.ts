import type { ComplianceRule } from "@/scanner/types/rule";

import { soc2DebugOutputSensitiveDataRule } from "@/scanner/rules/soc2/debug-output-sensitive-data";
import { soc2HardcodedSecretRule } from "@/scanner/rules/soc2/hardcoded-secret";
import { soc2InsecureHttpRule } from "@/scanner/rules/soc2/insecure-http";
import { privilegedActionWithoutAuditRule } from "@/scanner/rules/soc2/privileged-action-without-audit";
import { soc2WeakRandomSecurityTokenRule } from "@/scanner/rules/soc2/weak-random-security-token";

export const soc2Rules: ComplianceRule[] = [
  soc2HardcodedSecretRule,
  soc2InsecureHttpRule,
  soc2WeakRandomSecurityTokenRule,
  privilegedActionWithoutAuditRule,
  soc2DebugOutputSensitiveDataRule,
];

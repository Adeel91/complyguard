import type { ComplianceRule } from "@/scanner/types/rule";

import { isoDisabledTlsRule } from "@/scanner/rules/iso27001/disabled-tls";
import { isoDynamicCodeRule } from "@/scanner/rules/iso27001/dynamic-code";
import { isoHardcodedSecretRule } from "@/scanner/rules/iso27001/hardcoded-secret";
import { isoInsecureHttpRule } from "@/scanner/rules/iso27001/insecure-http";
import { isoInsecureRandomRule } from "@/scanner/rules/iso27001/insecure-random";
import { isoPrivilegedAuditRule } from "@/scanner/rules/iso27001/privileged-audit";
import { isoSensitiveLoggingRule } from "@/scanner/rules/iso27001/sensitive-logging";
import { isoWeakCryptoRule } from "@/scanner/rules/iso27001/weak-crypto";

export const iso27001Rules: ComplianceRule[] = [
  isoHardcodedSecretRule,
  isoInsecureHttpRule,
  isoWeakCryptoRule,
  isoDynamicCodeRule,
  isoDisabledTlsRule,
  isoSensitiveLoggingRule,
  isoInsecureRandomRule,
  isoPrivilegedAuditRule,
];

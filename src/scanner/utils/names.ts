/**
 * Sensitive and personal data name matching utilities.
 *
 * Matching strategy
 * -----------------
 * Identifiers are split at camelCase, snake_case, and non-alphanumeric
 * boundaries. A name is only considered sensitive or personal when one of
 * the registered terms appears as a complete word token, not as a substring
 * of a larger word.
 *
 * For example:
 *   "password"    → sensitive  ✓
 *   "userPassword"→ sensitive  ✓  (whole token after split)
 *   "tokenize"    → NOT sensitive  (split produces ["tokenize"], no exact match for "token")
 *   "accessor"    → NOT sensitive  (no exact match for "access")
 *   "addressable" → NOT personal   (no exact match for "address")
 */

const PERSONAL_DATA_NAMES: ReadonlySet<string> = new Set([
  "email",
  "phone",
  "phonenumber",
  "address",
  "street",
  "postalcode",
  "zip",
  "dateofbirth",
  "birthdate",
  "dob",
  "firstname",
  "lastname",
  "fullname",
  "ip",
  "ipaddress",
  "location",
]);

const SENSITIVE_DATA_NAMES: ReadonlySet<string> = new Set([
  "password",
  "passwd",
  "token",
  "accesstoken",
  "refreshtoken",
  "secret",
  "apikey",
  "authorization",
  "creditcard",
  "cardnumber",
  "cvv",
  "ssn",
  "nationalid",
  "healthdata",
  "medicalrecord",
]);

/**
 * Splits an identifier into lowercase word tokens.
 *
 * Handles camelCase, PascalCase, snake_case, SCREAMING_SNAKE,
 * kebab-case, and dotted.notation.
 *
 * "accessToken"    → ["access", "token"]
 * "USER_PASSWORD"  → ["user", "password"]
 * "tokenize"       → ["tokenize"]          ← not split further
 * "addressable"    → ["addressable"]        ← not split further
 */
export function tokenizeIdentifier(value: string): string[] {
  // Insert a word boundary before uppercase letters that follow lowercase or digits,
  // and before sequences of uppercase letters followed by lowercase.
  const withBoundaries = value
    .replace(/([a-z\d])([A-Z])/g, "$1_$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1_$2");

  return withBoundaries
    .split(/[^a-zA-Z\d]+/)
    .map((token) => token.toLowerCase())
    .filter((token) => token.length > 0);
}

/**
 * Returns true when any token window in `value` exactly matches a known
 * sensitive data name. Windows of 1, 2, and 3 consecutive tokens are tested
 * to handle compound names such as "accessToken" or "dateOfBirth".
 */
export function containsSensitiveName(value: string): boolean {
  return matchesTokenSet(tokenizeIdentifier(value), SENSITIVE_DATA_NAMES);
}

/**
 * Returns true when any token window in `value` exactly matches a known
 * personal data name, using the same strategy as containsSensitiveName.
 */
export function containsPersonalName(value: string): boolean {
  return matchesTokenSet(tokenizeIdentifier(value), PERSONAL_DATA_NAMES);
}

/**
 * Checks whether any 1-, 2-, or 3-token window in `tokens` appears in
 * `nameSet` (after concatenation). This handles single-word names ("token"),
 * two-word compounds ("accessToken" → "accesstoken"), and three-word compounds
 * ("dateOfBirth" → "dateofbirth").
 */
function matchesTokenSet(
  tokens: string[],
  nameSet: ReadonlySet<string>,
): boolean {
  for (let i = 0; i < tokens.length; i++) {
    // 1-token window
    if (nameSet.has(tokens[i])) {
      return true;
    }

    // 2-token window
    if (i + 1 < tokens.length && nameSet.has(tokens[i] + tokens[i + 1])) {
      return true;
    }

    // 3-token window
    if (
      i + 2 < tokens.length &&
      nameSet.has(tokens[i] + tokens[i + 1] + tokens[i + 2])
    ) {
      return true;
    }
  }

  return false;
}

// ── Exact-match helpers used by individual rules ──────────────────────────────

export function isPersonalDataName(value: string): boolean {
  const tokens = tokenizeIdentifier(value);

  if (tokens.some((t) => PERSONAL_DATA_NAMES.has(t))) {
    return true;
  }

  for (let i = 0; i < tokens.length - 1; i++) {
    if (PERSONAL_DATA_NAMES.has(tokens[i] + tokens[i + 1])) {
      return true;
    }
  }

  return false;
}

export function isSensitiveDataName(value: string): boolean {
  const tokens = tokenizeIdentifier(value);

  if (tokens.some((t) => SENSITIVE_DATA_NAMES.has(t))) {
    return true;
  }

  for (let i = 0; i < tokens.length - 1; i++) {
    if (SENSITIVE_DATA_NAMES.has(tokens[i] + tokens[i + 1])) {
      return true;
    }
  }

  return false;
}

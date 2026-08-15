const PERSONAL_DATA_NAMES = new Set([
  "email",
  "phone",
  "phoneNumber",
  "address",
  "street",
  "postalCode",
  "zip",
  "dateOfBirth",
  "birthDate",
  "dob",
  "firstName",
  "lastName",
  "fullName",
  "ip",
  "ipAddress",
  "location",
]);

const SENSITIVE_DATA_NAMES = new Set([
  "password",
  "passwd",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "authorization",
  "creditCard",
  "cardNumber",
  "cvv",
  "ssn",
  "nationalId",
  "healthData",
  "medicalRecord",
]);

export function normalizeIdentifier(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

export function isPersonalDataName(value: string): boolean {
  const normalized = normalizeIdentifier(value);

  return Array.from(PERSONAL_DATA_NAMES).some(
    (name) => normalizeIdentifier(name) === normalized,
  );
}

export function isSensitiveDataName(value: string): boolean {
  const normalized = normalizeIdentifier(value);

  return Array.from(SENSITIVE_DATA_NAMES).some(
    (name) => normalizeIdentifier(name) === normalized,
  );
}

export function containsSensitiveName(value: string): boolean {
  const normalized = normalizeIdentifier(value);

  return Array.from(SENSITIVE_DATA_NAMES).some((name) =>
    normalized.includes(normalizeIdentifier(name)),
  );
}

export function containsPersonalName(value: string): boolean {
  const normalized = normalizeIdentifier(value);

  return Array.from(PERSONAL_DATA_NAMES).some((name) =>
    normalized.includes(normalizeIdentifier(name)),
  );
}

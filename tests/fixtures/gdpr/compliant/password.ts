import { timingSafeEqual } from "node:crypto";

type PasswordVerifier = (
  password: string,
  passwordHash: string,
) => Promise<boolean>;

// Compliant: uses a dedicated verifier function, no direct comparison.
export async function authenticate(
  password: string,
  passwordHash: string,
  verifyPassword: PasswordVerifier,
) {
  return verifyPassword(password, passwordHash);
}

// Compliant: null guard — not a plaintext credential comparison.
export function hasPassword(password: string | null): boolean {
  return password !== null;
}

// Compliant: timing-safe buffer comparison.
export function safeCompare(a: Buffer, b: Buffer): boolean {
  return timingSafeEqual(a, b);
}

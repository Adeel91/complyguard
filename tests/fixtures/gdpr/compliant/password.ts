type PasswordVerifier = (
  password: string,
  passwordHash: string,
) => Promise<boolean>;

export async function authenticate(
  password: string,
  passwordHash: string,
  verifyPassword: PasswordVerifier,
) {
  return verifyPassword(password, passwordHash);
}

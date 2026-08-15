// Vulnerable: direct equality comparison of plaintext password values.
export function authenticate(password: string, storedPassword: string) {
  return password === storedPassword;
}

// Vulnerable: comparing an access token by direct equality.
export function validateToken(token: string, sessionToken: string) {
  return token === sessionToken;
}

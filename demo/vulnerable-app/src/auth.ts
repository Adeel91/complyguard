export function authenticate(
  password: string,
  storedPassword: string,
) {
  return password === storedPassword;
}

export function createAccessToken() {
  const accessToken =
    Math.random().toString(36);

  return accessToken;
}

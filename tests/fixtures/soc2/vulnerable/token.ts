export function createSession() {
  const accessToken = Math.random().toString(36);
  return accessToken;
}

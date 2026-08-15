export function createToken() {
  const accessToken = Math.random().toString(36);
  return accessToken;
}

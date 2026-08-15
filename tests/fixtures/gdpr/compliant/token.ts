import { randomUUID } from "node:crypto";

export function createToken() {
  const accessToken = randomUUID();
  return accessToken;
}

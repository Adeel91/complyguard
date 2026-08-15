import { randomUUID } from "node:crypto";

export function createSession() {
  const accessToken = randomUUID();
  return accessToken;
}

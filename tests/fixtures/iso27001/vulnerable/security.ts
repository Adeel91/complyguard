import { createHash } from "node:crypto";

export async function deleteUser(userId: string) {
  await removeUser(userId);
}

async function removeUser(userId: string) {
  return userId.length > 0;
}

export function unsafe(email: string, input: string) {
  const apiKey = "abcdefghijklmnopqrstuvwxyz123456";
  const accessToken = Math.random().toString(36);

  const options = {
    rejectUnauthorized: false,
  };

  console.log(email);

  createHash("md5").update(email).digest("hex");

  eval(input);

  fetch("http://example.com/api");

  return {
    apiKey,
    accessToken,
    options,
  };
}

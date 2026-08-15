import {
  createHash,
  randomUUID,
} from "node:crypto";

export async function deleteUser(userId: string) {
  await removeUser(userId);

  auditLog({
    action: "deleteUser",
    target: userId,
  });
}

async function removeUser(userId: string) {
  return userId.length > 0;
}

function auditLog(event: object) {
  return Object.keys(event).length > 0;
}

export function safe(userId: string) {
  const apiKey = process.env.API_KEY;
  const accessToken = randomUUID();

  const options = {
    rejectUnauthorized: true,
  };

  console.log("Processing user", userId);

  createHash("sha256").update(userId).digest("hex");

  fetch("https://example.com/api");

  return {
    apiKey,
    accessToken,
    options,
  };
}

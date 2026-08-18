import {
  createHash,
} from "node:crypto";

export function insecureHash(
  email: string,
) {
  return createHash("md5")
    .update(email)
    .digest("hex");
}

export const tlsOptions = {
  rejectUnauthorized: false,
};

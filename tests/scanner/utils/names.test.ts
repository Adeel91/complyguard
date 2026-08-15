import { describe, expect, it } from "vitest";

import {
  containsPersonalName,
  containsSensitiveName,
  tokenizeIdentifier,
} from "@/scanner/utils/names";

describe("tokenizeIdentifier", () => {
  it("splits camelCase identifiers", () => {
    expect(tokenizeIdentifier("accessToken")).toEqual(["access", "token"]);
    expect(tokenizeIdentifier("refreshToken")).toEqual(["refresh", "token"]);
    expect(tokenizeIdentifier("userPassword")).toEqual(["user", "password"]);
    expect(tokenizeIdentifier("firstName")).toEqual(["first", "name"]);
  });

  it("splits snake_case identifiers", () => {
    expect(tokenizeIdentifier("access_token")).toEqual(["access", "token"]);
    expect(tokenizeIdentifier("api_key")).toEqual(["api", "key"]);
    expect(tokenizeIdentifier("user_email")).toEqual(["user", "email"]);
  });

  it("splits SCREAMING_SNAKE identifiers", () => {
    expect(tokenizeIdentifier("API_KEY")).toEqual(["api", "key"]);
    expect(tokenizeIdentifier("ACCESS_TOKEN")).toEqual(["access", "token"]);
  });

  it("returns a single token for simple lowercase words", () => {
    expect(tokenizeIdentifier("tokenize")).toEqual(["tokenize"]);
    expect(tokenizeIdentifier("accessor")).toEqual(["accessor"]);
    expect(tokenizeIdentifier("addressable")).toEqual(["addressable"]);
    expect(tokenizeIdentifier("password")).toEqual(["password"]);
  });
});

describe("containsSensitiveName", () => {
  it("matches known sensitive identifiers", () => {
    expect(containsSensitiveName("password")).toBe(true);
    expect(containsSensitiveName("userPassword")).toBe(true);
    expect(containsSensitiveName("accessToken")).toBe(true);
    expect(containsSensitiveName("refreshToken")).toBe(true);
    expect(containsSensitiveName("apiKey")).toBe(true);
    expect(containsSensitiveName("secret")).toBe(true);
    expect(containsSensitiveName("token")).toBe(true);
    expect(containsSensitiveName("authorization")).toBe(true);
  });

  it("does not match non-sensitive words that contain sensitive substrings", () => {
    // "tokenize" contains "token" as a substring but is a single whole token
    expect(containsSensitiveName("tokenize")).toBe(false);
    // "accessor" contains "access" as a substring
    expect(containsSensitiveName("accessor")).toBe(false);
    // "secretarial" is not in the set
    expect(containsSensitiveName("secretarial")).toBe(false);
    // "passwords" is a different word
    expect(containsSensitiveName("passwords")).toBe(false);
  });

  it("handles snake_case and SCREAMING_SNAKE", () => {
    expect(containsSensitiveName("access_token")).toBe(true);
    expect(containsSensitiveName("API_KEY")).toBe(true);
    expect(containsSensitiveName("user_secret")).toBe(true);
  });
});

describe("containsPersonalName", () => {
  it("matches known personal data identifiers", () => {
    expect(containsPersonalName("email")).toBe(true);
    expect(containsPersonalName("userEmail")).toBe(true);
    expect(containsPersonalName("address")).toBe(true);
    expect(containsPersonalName("phoneNumber")).toBe(true);
    expect(containsPersonalName("firstName")).toBe(true);
    expect(containsPersonalName("dateOfBirth")).toBe(true);
    expect(containsPersonalName("ipAddress")).toBe(true);
  });

  it("does not match words that merely contain personal substrings", () => {
    // "addressable" contains "address" as a substring but is a different word
    expect(containsPersonalName("addressable")).toBe(false);
    // "emailing" is not an exact token
    expect(containsPersonalName("emailing")).toBe(false);
  });

  it("handles compound personal names", () => {
    expect(containsPersonalName("user_email")).toBe(true);
    expect(containsPersonalName("ip_address")).toBe(true);
  });
});

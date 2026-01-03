import type { Request } from "express";
import { describe, it, expect, beforeAll } from "vitest";

import {
  checkPasswordHash,
  getBearerToken,
  hashPassword,
  makeJWT,
  validateJWT,
} from "./auth.js";
import { UserNotAuthenticatedError } from "./api/error.js";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("should return true for the correct password", async () => {
    const result = await checkPasswordHash(password1, hash1);
    expect(result).toBe(true);
  });
  it("should return false for an incorrect password", async () => {
    const result = await checkPasswordHash("wrongPassword", hash1);
    expect(result).toBe(false);
  });
  it("should return false when a password doesn't match a different hash", async () => {
    const result = await checkPasswordHash(password1, hash2);
    expect(result).toBe(false);
  });
  it("should return false for an empty password", async () => {
    const result = await checkPasswordHash("", hash1);
    expect(result).toBe(false);
  });
  it("should return false for an invalid hash", async () => {
    const result = await checkPasswordHash(password1, "invalidHash");
    expect(result).toBe(false);
  });
});

describe("JWT Functions", () => {
  const secret = "secret";
  const wrongSecret = "wrong_secret";
  const userId = "some-unique-user-id";
  let validToken: string;

  beforeAll(() => {
    validToken = makeJWT(userId, 3600, secret);
  });

  it("should validate a valid token", () => {
    const result = validateJWT(validToken, secret);
    expect(result).toBe(userId);
  });
  it("should throw an error for an invalid token string", () => {
    expect(() => validateJWT("invalid.token.string", secret)).toThrow(
      UserNotAuthenticatedError
    );
  });
  it("should throw an error when the token is sign with a wrong secret", () => {
    expect(() => validateJWT(validToken, wrongSecret)).toThrow(
      UserNotAuthenticatedError
    );
  });
});

// describe("Get bearer token", () => {
//   const token = "test-token";
//   const req: Request = {
//     headers: {
//       authorization: `Bearer ${token}`,
//     },
//   };
//   const wrongReq = {
//     headers: {},
//   } as Request;

//   it("should return the correct token", () => {
//     const result = getBearerToken(req);
//     expect(result).toBe(token);
//   });
//   it("should throw an error when you don't pass a token", () => {
//     expect(() => getBearerToken(wrongReq)).toThrow(UserNotAuthenticatedError);
//   });
// });

import * as argon2 from "argon2";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Request } from "express";
import crypto from "crypto";

import { UserNotAuthenticatedError } from "./api/error.js";

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

export async function checkPasswordHash(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    return false;
  }
}

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

const TOKEN_ISSUER = "chirpy";

export function makeJWT(
  userId: string,
  expiresIn: number,
  secret: string
): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresIn;
  const token = jwt.sign(
    {
      iss: TOKEN_ISSUER,
      exp: expiresAt,
      iat: issuedAt,
      sub: userId,
    } satisfies Payload,
    secret,
    { algorithm: "HS256" }
  );

  return token;
}

export function validateJWT(tokenString: string, secret: string): string {
  let decoded: Payload;
  try {
    decoded = jwt.verify(tokenString, secret) as JwtPayload;
  } catch (err) {
    throw new UserNotAuthenticatedError("Invalid token");
  }

  if (decoded.iss !== TOKEN_ISSUER) {
    throw new UserNotAuthenticatedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UserNotAuthenticatedError("No user ID in token");
  }
  return decoded.sub;
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }

  const token = authHeader.replace("Bearer", "").trim();
  return token;
}

export async function makeRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function getAPIKey(req: Request) {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new UserNotAuthenticatedError("Malformed authorization header");
  }

  const apiKey = authHeader.replace("ApiKey", "").trim();
  return apiKey;
}

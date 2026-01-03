import type { Request, Response } from "express";

import { BadRequestError } from "./error.js";
import { createUser, updateUser } from "../db/queries/users.js";
import { respondWithJSON } from "./json.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { User } from "../db/schema.js";
import { config } from "../config.js";

export type UserResponse = Omit<User, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response) {
  type Parameters = {
    email: string;
    password: string;
  };

  const params: Parameters = req.body;
  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(params.password);
  const user = await createUser({
    email: params.email,
    hashedPassword,
  });
  if (!user) {
    throw new Error("Could not create user");
  }

  respondWithJSON(res, 201, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    isChirpyRed: user.isChirpyRed,
  } satisfies UserResponse);
}

export async function handlerUpdateUser(req: Request, res: Response) {
  type Parameters = {
    email: string;
    password: string;
  };

  const accessToken = getBearerToken(req);

  const userId = validateJWT(accessToken, config.jwt.secret);

  const params: Parameters = req.body;
  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const hashedPassword = await hashPassword(params.password);
  const user = await updateUser(userId, params.email, hashedPassword);

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    isChirpyRed: user.isChirpyRed,
  } satisfies UserResponse);
}

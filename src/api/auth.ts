import type { Request, Response } from "express";

import {
  BadRequestError,
  NotFoundError,
  UserNotAuthenticatedError,
} from "./error.js";
import { getUserByEmail } from "../db/queries/users.js";
import {
  checkPasswordHash,
  getBearerToken,
  makeJWT,
  makeRefreshToken,
} from "../auth.js";
import { config } from "../config.js";
import { respondWithJSON } from "./json.js";
import type { UserResponse } from "./users.js";
import {
  revokeRefreshToken,
  saveRefreshToken,
  userFromRefreshToken,
} from "../db/queries/refresh.js";

type LoginResponse = UserResponse & {
  token: string;
  refreshToken: string;
};

export async function handlerLogin(req: Request, res: Response) {
  type Parameters = {
    email: string;
    password: string;
  };

  const params: Parameters = req.body;
  if (!params.email || !params.password) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await getUserByEmail(params.email);
  if (!user) {
    throw new NotFoundError(`User ${params.email} not found!`);
  }

  const matching = await checkPasswordHash(
    params.password,
    user.hashedPassword
  );
  if (!matching) {
    throw new UserNotAuthenticatedError("Incorrect email or password");
  }

  const accessToken = makeJWT(
    user.id,
    config.jwt.defaultDuration,
    config.jwt.secret
  );

  const refreshToken = await makeRefreshToken();
  const saved = await saveRefreshToken(user.id, refreshToken);
  if (!saved) {
    throw new UserNotAuthenticatedError("could not save refresh token");
  }

  respondWithJSON(res, 200, {
    id: user.id,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    email: user.email,
    isChirpyRed: user.isChirpyRed,
    token: accessToken,
    refreshToken: refreshToken,
  } satisfies LoginResponse);
}

export async function handlerRefresh(req: Request, res: Response) {
  const token = getBearerToken(req);
  const result = await userFromRefreshToken(token);
  if (!result) {
    throw new UserNotAuthenticatedError("Invalid refresh token");
  }

  const user = result.user;
  const accessToken = makeJWT(
    user.id,
    config.jwt.defaultDuration,
    config.jwt.secret
  );

  type response = {
    token: string;
  };

  respondWithJSON(res, 200, {
    token: accessToken,
  } satisfies response);
}

export async function handlerRevoke(req: Request, res: Response) {
  const token = getBearerToken(req);
  await revokeRefreshToken(token);
  res.status(204).send();
}

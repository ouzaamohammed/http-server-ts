import type { Request, Response } from "express";

import {
  BadRequestError,
  NotFoundError,
  UserNotAuthenticatedError,
} from "./error.js";
import { updateUserChirpyRed } from "../db/queries/users.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js";

export async function handlerWebhook(req: Request, res: Response) {
  type Parameters = {
    event: string;
    data: {
      userId: string;
    };
  };

  const params: Parameters = req.body;
  if (!params.event || !params.data.userId) {
    throw new BadRequestError("Missing required fields");
  }

  if (params.event !== "user.upgraded") {
    res.status(204).send();
    return;
  }

  const id = params.data.userId;
  const user = await updateUserChirpyRed(id);
  if (!user) {
    throw new NotFoundError(`User with ID: ${id} not found`);
  }

  const apiKey = getAPIKey(req);
  if (apiKey !== config.api.polkaKey) {
    throw new UserNotAuthenticatedError("Malformed api key");
  }

  res.status(204).send();
}

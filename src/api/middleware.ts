import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { respondWithError } from "./json.js";
import {
  BadRequestError,
  NotFoundError,
  UserForbiddenError,
  UserNotAuthenticatedError,
} from "./error.js";

export function middlewareLogResponses(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  res.on("finish", () => {
    if (res.statusCode >= 300) {
      console.log(
        `[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`,
      );
    }
  });
  next();
}

export function middlewareMetricsInc(
  _: Request,
  __: Response,
  next: NextFunction,
) {
  config.api.fileServerHits++;
  next();
}

export function errorMiddleware(
  err: Error,
  _: Request,
  res: Response,
  __: NextFunction,
) {
  let code = 500;
  const message = err.message;
  console.log(message);
  if (err instanceof BadRequestError) {
    code = 400;
  }
  if (err instanceof UserNotAuthenticatedError) {
    code = 401;
  }
  if (err instanceof UserForbiddenError) {
    code = 403;
  }
  if (err instanceof NotFoundError) {
    code = 404;
  }
  respondWithError(res, code, message);
}

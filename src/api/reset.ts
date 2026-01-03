import type { Request, Response } from "express";
import { config } from "../config.js";
import { reset } from "../db/queries/users.js";
import { UserForbiddenError } from "./error.js";

export async function handlerReset(_: Request, res: Response): Promise<void> {
  if (config.api.platform !== "dev") {
    console.log(config.api.platform);
    throw new UserForbiddenError("Reset is only allowed in dev environment.");
  }
  await reset();

  config.api.fileServerHits = 0;
  res.write("Hits reset to 0");
  res.end();
}

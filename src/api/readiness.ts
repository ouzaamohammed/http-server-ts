import type { Request, Response } from "express";

export async function handlerReadiness(
  _: Request,
  res: Response,
): Promise<void> {
  res.set({
    "Content-Type": "text/plain",
  });
  res.send("OK");
}

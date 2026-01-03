import type { Request, Response } from "express";

import { respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError, UserForbiddenError } from "./error.js";
import {
  createChirp,
  deleteChirp,
  getChirp,
  listAllChirps,
} from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";

function validateChirp(body: string) {
  const maxChirpLength = 140;
  if (body.length > maxChirpLength) {
    throw new BadRequestError("Chirp is too long. Max length is 140");
  }

  const words = body.split(" ");
  const cleanedWords = [];
  for (let word of words) {
    const loweredWord = word.toLowerCase();
    if (
      loweredWord === "kerfuffle" ||
      loweredWord === "sharbert" ||
      loweredWord === "fornax"
    ) {
      cleanedWords.push("****");
      continue;
    }

    cleanedWords.push(word);
  }

  return cleanedWords.join(" ");
}

export async function handlerCreateChirp(req: Request, res: Response) {
  type Parameters = {
    body: string;
  };

  const params: Parameters = req.body;
  if (!params.body) {
    throw new BadRequestError("Missing required fields");
  }

  const cleanedBody = validateChirp(params.body);

  const token = getBearerToken(req);
  const userId = validateJWT(token, config.jwt.secret);

  const chirp = await createChirp({ body: cleanedBody, userId });
  if (!chirp) {
    throw new Error("Could not create chirp");
  }

  respondWithJSON(res, 201, chirp);
}

export async function handlerListAllChirp(req: Request, res: Response) {
  let authorId = "";
  const authorIdQuery = req.query.authorId;
  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  }

  let sortDirection = "asc";
  const sortQuery = req.query.sort;
  if (typeof sortQuery === "string") {
    sortDirection = sortQuery;
  }

  const chirps = await listAllChirps(authorId);
  const filteredChirps = chirps.sort((a, b) =>
    sortDirection === "asc"
      ? a.createdAt.getTime() - b.createdAt.getTime()
      : b.createdAt.getTime() - a.createdAt.getTime()
  );

  respondWithJSON(res, 200, filteredChirps);
}

export async function handlerGetChirp(req: Request, res: Response) {
  const chirp = await getChirp(req.params.chirpId);
  if (!chirp) {
    throw new NotFoundError("Chirp not found");
  }

  respondWithJSON(res, 200, chirp);
}

export async function handlerDeleteChirp(req: Request, res: Response) {
  const accessToken = getBearerToken(req);
  const userId = validateJWT(accessToken, config.jwt.secret);
  const { chirpId } = req.params;

  const chirp = await getChirp(chirpId);
  if (!chirp) {
    throw new NotFoundError(`Chirp with ID: ${chirpId} not found`);
  }

  if (chirp.userId !== userId) {
    throw new UserForbiddenError("You can't delete this chirp");
  }

  const deleted = await deleteChirp(chirp.id, userId);
  if (!deleted) {
    throw new Error(`Failed to delete chirp with ID: ${chirpId}`);
  }

  res.status(204).send("chirp deleted successfully");
}

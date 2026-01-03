import { asc, desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps, newChirp } from "../schema.js";

export async function createChirp(chirp: newChirp) {
  const [result] = await db.insert(chirps).values(chirp).returning();
  return result;
}

export async function listAllChirps(authorId?: string) {
  let query = db.select().from(chirps);

  if (authorId) {
    query.where(eq(chirps.userId, authorId));
  }

  return await query;
}

export async function getChirp(id: string) {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, id));
  return result;
}

export async function deleteChirp(id: string, userId: string) {
  const rows = await db.delete(chirps).where(eq(chirps.id, id)).returning();
  return rows.length > 0;
}

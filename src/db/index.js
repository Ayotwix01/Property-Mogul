import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

let database;

export function getDatabase() {
  if (database) return database;
  const url =
    globalThis.process?.env?.DATABASE_URL ??
    globalThis.__env__?.DATABASE_URL ??
    globalThis?.env?.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required for persistent server operations.");
  }
  const client = neon(url);
  database = drizzle(client);
  return database;
}

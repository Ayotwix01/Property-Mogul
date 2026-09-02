import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.js",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: globalThis.process?.env?.DATABASE_URL || "",
  },
});

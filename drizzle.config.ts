import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle/migrations/",
  driver: "pg",
  dbCredentials: {
    database: process.env.DB_NAME as string,
    host: process.env.DB_HOST as string,
    user: process.env.DB_USER as string,
    password: process.env.DB_PASS as string,
    port: 5432,
  },
  verbose: true,
  strict: true,
});

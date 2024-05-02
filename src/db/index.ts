import { drizzle } from "drizzle-orm/postgres-js";
import schema from "./schema";
import postgres from "postgres";

export const connection = postgres({
  database: process.env.DB_NAME as string,
  host: process.env.DB_HOST as string,
  user: process.env.DB_USER as string,
  password: process.env.DB_PASS as string,
});

export const db = drizzle(connection, { schema });

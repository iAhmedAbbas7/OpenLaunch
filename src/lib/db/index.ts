// <== IMPORTS ==>
import postgres from "postgres";
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/postgres-js";

// <== VALIDATE REQUIRED ENVIRONMENT VARIABLE ==>
if (!process.env.DATABASE_URL) {
  // THROW AN ERROR IF THE DATABASE_URL IS NOT SET
  throw new Error("DATABASE_URL environment variable is required");
}

// <== CONNECTION POOL SETTINGS ==>
const connectionString = process.env.DATABASE_URL;

// <== CONNECTION OPTIONS ==>
const connectionOptions = {
  // MAX CONNECTIONS IN POOL
  max: process.env.NODE_ENV === "production" ? 10 : 5,
  // IDLE TIMEOUT IN SECONDS
  idle_timeout: 20,
  // CONNECTION TIMEOUT IN SECONDS
  connect_timeout: 10,
  // PREPARED STATEMENTS (DISABLE FOR SUPABASE POOLER)
  prepare: false,
};

// <== CREATE POSTGRES CLIENT WITH POOLING ==>
const client = postgres(connectionString, connectionOptions);

// <== CREATE DRIZZLE INSTANCE WITH SCHEMA ==>
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === "development",
});

// <== EXPORT SCHEMA FOR USE IN QUERIES ==>
export { schema };

// <== EXPORT TYPES ==>
export type Database = typeof db;

// <== CHECK DATABASE CONNECTION ==>
export const checkDatabaseConnection = async (): Promise<boolean> => {
  // TRY TO EXECUTE A SELECT 1 QUERY
  try {
    // EXECUTE A SELECT 1 QUERY
    await client`SELECT 1`;
    // RETURN TRUE IF THE QUERY SUCCEEDS
    return true;
  } catch (error) {
    // LOG ERROR
    console.error("Database Connection Failed:", error);
    // RETURN FALSE IF THE QUERY FAILS
    return false;
  }
};

// <== CLOSE DATABASE CONNECTION ==>
export const closeDatabaseConnection = async (): Promise<void> => {
  // TRY TO END THE CLIENT
  try {
    // END THE CLIENT
    await client.end();
  } catch (error) {
    // LOG ERROR
    console.error("Database Connection Failed:", error);
  }
};

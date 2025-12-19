// <== IMPORTS ==>
import { defineConfig } from "drizzle-kit";

// <== ENVIRONMENT VALIDATION ==>
if (!process.env.DATABASE_URL) {
  // THROW AN ERROR IF THE DATABASE_URL IS NOT SET
  throw new Error("DATABASE_URL environment variable is required");
}

// <== DRIZZLE CONFIG ==>
export default defineConfig({
  // SCHEMA FILE LOCATION
  schema: "./src/lib/db/schema.ts",
  // OUTPUT DIRECTORY FOR MIGRATIONS
  out: "./drizzle/migrations",
  // DATABASE DIALECT
  dialect: "postgresql",
  // DATABASE CONNECTION CONFIGURATION
  dbCredentials: {
    // DATABASE URL
    url: process.env.DATABASE_URL,
  },
  // VERBOSE OUTPUT DURING MIGRATIONS
  verbose: true,
  // STRICT MODE FOR SAFER MIGRATIONS
  strict: true,
  // TABLE FILTERS (INCLUDE ALL TABLES)
  tablesFilter: ["!_*"],
});

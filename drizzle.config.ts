import { defineConfig } from "drizzle-kit";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for database operations");
}

// Construct Supabase PostgreSQL connection URL
const supabaseUrl = new URL(process.env.SUPABASE_URL);
const databaseUrl = `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@${supabaseUrl.hostname}:6543/postgres`;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});

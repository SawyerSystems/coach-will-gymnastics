import { defineConfig } from "drizzle-kit";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required for database operations"
  );
}

// Construct Supabase PostgreSQL connection URL
// Use the DB hostname (db.<project>.supabase.co), pooled port 6543 by default, and require SSL
const supabaseUrl = new URL(process.env.SUPABASE_URL);
const host = `db.${supabaseUrl.hostname}`;
const port = process.env.SUPABASE_DB_PORT || "6543"; // set to 5432 to use direct connections if needed
const database = process.env.SUPABASE_DB_NAME || "postgres";
const user = process.env.SUPABASE_DB_USER || "postgres";
const password = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(
  password!
)}@${host}:${port}/${encodeURIComponent(database)}?sslmode=require`;

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});

import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    out: "./drizzle",
    schema: ["./src/db/schema.ts", "./auth-schema.ts"],
    dialect: "postgresql",
    dbCredentials: {
        url: `postgres://postgres:${process.env.POSTGRES_PASSWORD}@${process.env.DB_HOSTNAME ?? "localhost"}:5432/lnkcnt`,
    },
    verbose: true,
    strict: true,
});

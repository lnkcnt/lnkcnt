import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

function getConnectionString() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    } else {
        return `postgres://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@${process.env.DB_HOSTNAME ?? "localhost"}:5432/lnkcnt`;
    }
}

export const db = drizzle({
    connection: { connectionString: getConnectionString() },
});

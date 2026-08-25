import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

function getConnectionString() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    } else {
        return `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOSTNAME ?? "localhost"}:5432/lnkcnt`;
    }
}

export const valkeyConfig = {
    addresses: [
        {
            host: process.env.VALKEY_HOST ?? "localhost",
            port: Number(process.env.VALKEY_PORT ?? 6379),
        },
    ],
    credentials: {
        username: process.env.VALKEY_USERNAME,
        password: process.env.VALKEY_PASSWORD ?? "",
    },
};
export const db = drizzle({
    connection: {
        connectionString: getConnectionString(),
    },
});

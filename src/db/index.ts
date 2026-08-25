import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { GlideClient, GlideClientConfiguration } from "@valkey/valkey-glide";

function getConnectionString() {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    } else {
        return `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOSTNAME ?? "localhost"}:5432/lnkcnt`;
    }
}

export const db = drizzle({
    connection: { connectionString: getConnectionString() },
});

export const valkeyConfig: GlideClientConfiguration = {
    addresses: [
        {
            host: process.env.VALKEY_HOST ?? "localhost",
            port: Number(process.env.VALKEY_PORT),
        },
    ],
};

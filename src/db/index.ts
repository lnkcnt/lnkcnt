import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";

const databaseConnectionUri = process.env.DATABASE_URL;

if (!databaseConnectionUri) {
    console.error(
        "Database connection URI is not provided in environment variables.",
        "Provide DATABASE_URL variable in '.env' file.",
    );
}
export const db = drizzle({
    connection: { uri: databaseConnectionUri },
});

// You can specify any property from the mysql2 connection options

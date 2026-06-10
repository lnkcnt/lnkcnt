import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { hashPassword, verifyPassword } from "./password";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { db } from "@/src/db";
import {
    account,
    accountRelations,
    session,
    sessionRelations,
    user,
    userRelations,
    verification,
} from "@/auth-schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user,
            account,
            session,
            verification,
            userRelations,
            sessionRelations,
            accountRelations,
        },
    }),
    plugins: [nextCookies()],
    emailAndPassword: {
        enabled: true,
        password: {
            hash: hashPassword,
            verify: verifyPassword,
        },
        // disableSignUp: true,
    },
    session: {
        expiresIn: 300,
        updateAge: 0,
    },
});

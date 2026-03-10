import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "./password";

export const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "mysql" }),
    plugins: [nextCookies()],
    emailAndPassword: {
        enabled: true,
        password: {
            hash: hashPassword,
            verify: verifyPassword,
        },
        disableSignUp: true,
    },
    session: {
        expiresIn: 60,
        updateAge: 0,
    },
});

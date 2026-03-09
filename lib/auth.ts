import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "mysql" }),
    plugins: [nextCookies()],
    emailAndPassword: {
        enabled: true,
    },
    session: {
        expiresIn: 60, // 5분
        updateAge: 0, // 요청마다 세션 갱신
    },
});

"use server";

import { user } from "@/auth-schema";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { styleText } from "node:util";

/**
 * Create an admin account when the secret code matches DATABASE_PASSWORD.
 * @param formData - The submitted form data from the account creation form.
 */
export async function createAdminAccount(formData: FormData): Promise<void> {
    /** Submitted email value from the account creation form. */
    const email = formData.get("email");
    /** Submitted password value from the account creation form. */
    const password = formData.get("password");
    /** Submitted secret code value from the account creation form. */
    const secretCode = formData.get("secretCode");

    if (
        typeof email !== "string" ||
        typeof password !== "string" ||
        typeof secretCode !== "string"
    ) {
        console.error(
            styleText("red", "ERROR:"),
            "formData contains invalid value(s).",
        );
        redirect("/admin/create?error=1");
    }

    /** Secret value configured in environment variable for account creation authorization. */
    const databasePassword = process.env.ADMIN_CREATION_SECRET;

    if (!databasePassword) {
        console.error(
            styleText("red", "ERROR:"),
            'ADMIN_CREATION_SECRET is not defined. Define this in ".env" file.',
        );
        redirect("/admin/create?error=1");
    }

    if (secretCode !== databasePassword) {
        console.error(
            styleText("red", "ERROR:"),
            "secretCode does not match in admin account creation.",
        );
        redirect("/admin/create?error=1");
    }

    const userQuery = await db.select().from(user);

    if (userQuery.length >= 1) {
        console.error(styleText("red", "ERROR:"), "User already exists.");
        notFound();
    }

    /** Fallback name value required by Better Auth email sign-up endpoint. */
    const name = "admin";

    try {
        await auth.api.signUpEmail({
            body: {
                name,
                email,
                password,
            },
            headers: await headers(),
        });
    } catch (e) {
        console.error(`ERROR: ${e}`);
        redirect("/admin/create?error=1");
    }

    redirect("/admin");
}

export async function checkAdminExists(): Promise<boolean> {
    const userQuery = await db.select().from(user);

    if (userQuery.length >= 1) {
        return true;
    } else {
        return false;
    }
}

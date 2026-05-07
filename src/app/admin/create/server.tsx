import { user } from "@/auth-schema";
import { auth } from "@/lib/auth";
import { db } from "@/src/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Usable } from "react";

type SearchParamValue = string | string[] | undefined;

export type CreateAdminAccountPageProps = {
    searchParams: Usable<Record<string, SearchParamValue>>;
};

/**
 * Create an admin account when the secret code matches DATABASE_PASSWORD.
 * @param formData - The submitted form data from the account creation form.
 */
export async function createAdminAccount(formData: FormData): Promise<void> {
    "use server";

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
        redirect("/admin/create?error=1");
    }

    /** Secret value configured in environment variable for account creation authorization. */
    const databasePassword = process.env.ADMIN_CREATION_SECRET;

    if (!databasePassword) {
        console.error("ADMIN_CREATION_SECRET is not defined");
        redirect("/admin/create?error=1");
    }

    if (secretCode !== databasePassword) {
        console.error("secretCode does not match");
        redirect("/admin/create?error=1");
    }

    const userQuery = await db.select().from(user);

    if (userQuery.length >= 1) {
        console.error("User already exists");
        redirect("/admin/create?error=1");
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
        console.error(e);
        redirect("/admin/create?error=1");
    }

    redirect("/admin");
}

/**
 * Resolve query-string error key to user-facing text.
 * @param errorKey - Error key from query string.
 * @returns Human-readable error message.
 */
export function getErrorMessage(errorKey?: string): string {
    // if (errorKey === "invalid_form") {
    //     return "Please provide email, password, and secret code.";
    // }
    // if (errorKey === "server_secret_not_set") {
    //     return "Server is missing DATABASE_PASSWORD configuration.";
    // }
    // if (errorKey === "invalid_secret") {
    //     return "Secret code does not match.";
    // }
    // if (errorKey === "signup_failed") {
    //     return "Failed to create account. The email may already exist.";
    // }
    if (errorKey) {
        return "Failed.";
    } else {
        return "";
    }
}

export async function checkAdminExists(): Promise<boolean> {
    "use server";
    const userQuery = await db.select().from(user);

    if (userQuery.length >= 1) {
        return true;
    } else {
        return false;
    }
}

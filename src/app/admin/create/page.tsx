import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/src/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { JSX } from "react";

type SearchParamValue = string | string[] | undefined;

type CreateAdminAccountPageProps = {
    searchParams:
        | Promise<Record<string, SearchParamValue>>
        | Record<string, SearchParamValue>;
};

/**
 * Create an admin account when the secret code matches DATABASE_PASSWORD.
 * @param formData - The submitted form data from the account creation form.
 */
async function createAdminAccount(formData: FormData): Promise<void> {
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
        redirect("/admin/create?error=1");
    }

    if (secretCode !== databasePassword) {
        redirect("/admin/create?error=1");
    }

    const userQuery = await prisma.user.findMany();

    if (userQuery.length >= 1) {
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
    } catch {
        redirect("/admin/create?error=1");
    }

    redirect("/admin");
}

/**
 * Resolve query-string error key to user-facing text.
 * @param errorKey - Error key from query string.
 * @returns Human-readable error message.
 */
function getErrorMessage(errorKey?: string): string {
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
    }
    return "";
}

/**
 * Admin account creation page.
 * @param props - Page props from Next.js.
 * @returns Admin account creation form.
 */
export default async function CreateAdminAccountPage({
    searchParams,
}: CreateAdminAccountPageProps): Promise<JSX.Element> {
    /** Resolved search params from the current request. */
    const resolvedSearchParams = await searchParams;
    /** Error key from query string. */
    const errorKey =
        typeof resolvedSearchParams.error === "string"
            ? resolvedSearchParams.error
            : undefined;
    /** User-visible error text rendered above form. */
    const errorMessage = getErrorMessage(errorKey);

    return (
        <main className="container mx-auto flex min-h-[70dvh] items-center justify-center px-4 py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create Admin Account</CardTitle>
                    <CardDescription>
                        Create an admin account using a valid secret code.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {errorMessage ? (
                        <p className="border-destructive/40 bg-destructive/10 text-destructive mb-4 rounded-md border p-3 text-sm">
                            {errorMessage}
                        </p>
                    ) : null}
                    <form action={createAdminAccount} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">E-mail</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="admin@example.com"
                                autoComplete="email"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secretCode">Secret Code</Label>
                            <Input
                                id="secretCode"
                                name="secretCode"
                                type="password"
                                autoComplete="off"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Create Account
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}

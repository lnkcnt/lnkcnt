"use server";

import { user } from "@/auth-schema";
import { auth } from "@/lib/auth";
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
import { db } from "@/src/db";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { styleText } from "node:util";

/**
 * Create an admin account when the secret code matches DATABASE_PASSWORD.
 * @param formData - The submitted form data from the account creation form.
 */
export async function createAdminAccount(formData: FormData): Promise<void> {
    const isE2ETest =
        process.env.NODE_ENV === "development"
            ? formData.get("e2eTest") === "1"
            : false;

    if (!isE2ETest && (await checkAdminExists())) {
        console.error(styleText("red", "ERROR:"), "User already exists.");
        notFound();
    }

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
        if (isE2ETest) {
            console.log(
                styleText("blue", "INFO:"),
                "Incorrect secretCode is entered in E2E test.",
            );
        } else {
            console.error(
                styleText("red", "ERROR:"),
                "secretCode does not match in admin account creation.",
            );
        }
        redirect("/admin/create?error=1");
    }

    /** Fallback name value required by Better Auth email sign-up endpoint. */
    const name = "admin";

    try {
        if (isE2ETest) {
            // simulate successful sign up
        } else {
            await auth.api.signUpEmail({
                body: {
                    name,
                    email,
                    password,
                },
                headers: await headers(),
            });
        }
    } catch (e) {
        console.error(`ERROR: ${e}`);
        redirect("/admin/create?error=1");
    }

    redirect("/admin");
}

export async function checkAdminExists(): Promise<boolean> {
    const userQuery = await db.select().from(user).limit(1);

    return userQuery.length >= 1;
}

export default async function AdminCreationPage({
    searchParams,
}: {
    searchParams?: Promise<{ e2e?: string }>;
}) {
    const resolvedSearchParams = await searchParams;
    const e2eMode = resolvedSearchParams?.e2e;
    const isE2ENone =
        process.env.NODE_ENV === "development" ? e2eMode === "none" : false;
    const isE2EExisting =
        process.env.NODE_ENV === "development" ? e2eMode === "existing" : false;

    if (isE2EExisting || (!isE2ENone && (await checkAdminExists()))) {
        notFound();
    }

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
                    <form action={createAdminAccount} className="space-y-4">
                        {isE2ENone ? (
                            <input name="e2eTest" type="hidden" value="1" />
                        ) : null}
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

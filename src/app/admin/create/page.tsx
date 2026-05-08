"use client";

import { Button } from "@/src/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { createAdminAccount } from "./server";
import { useSearchParams } from "next/navigation";

/**
 * Resolve query-string error key to user-facing text.
 * @param errorKey - Error key from query string.
 * @returns Human-readable error message.
 */
function getErrorMessage(errorKey?: string | null) {
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
        return null;
    }
}

/**
 * Admin account creation page.
 * @param props - Page props from Next.js.
 * @returns Admin account creation form.
 */
export default function CreateAdminAccountPage() {
    const searchParams = useSearchParams();
    const errorKey = searchParams.get("error");

    /** Resolved search params from the current request. */
    /** Error key from query string. */
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

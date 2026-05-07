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
import { JSX, use, useEffect, useState } from "react";
import {
    CreateAdminAccountPageProps,
    getErrorMessage,
    createAdminAccount,
} from "./server";

/**
 * Admin account creation page.
 * @param props - Page props from Next.js.
 * @returns Admin account creation form.
 */
export default function CreateAdminAccountPage({
    searchParams,
}: CreateAdminAccountPageProps): JSX.Element {
    const resolvedSearchParams = use(searchParams);
    const [errorKey, setErrorKey] = useState("");
    useEffect(() => {
        setErrorKey(
            typeof resolvedSearchParams.error === "string"
                ? resolvedSearchParams.error
                : undefined,
        );
    });
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

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
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { JSX } from "react";

/**
 * Sign in an admin user with Better Auth email/password auth.
 * @param formData - The submitted form data from the admin sign-in form.
 */
async function signIn(formData: FormData): Promise<void> {
    "use server";

    /** Submitted email value from the sign-in form. */
    const email = formData.get("email");
    /** Submitted password value from the sign-in form. */
    const password = formData.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
        return;
    }

    try {
        await auth.api.signInEmail({
            body: {
                email,
                password,
            },
            headers: await headers(),
        });
    } catch {
        return;
    }

    redirect("/admin");
}

async function signOut() {
    "use server";
    await auth.api.signOut({
        // This endpoint requires session cookies.
        headers: await headers(),
    });

    redirect("/");
}

/**
 * Admin route entry page.
 * Shows admin content when authenticated, otherwise shows the login form.
 * @returns A protected admin page or sign-in UI.
 */
export default async function SignInPage(): Promise<JSX.Element> {
    /** Current Better Auth session for this request. */
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (session) {
        return <AdminPage />;
    }

    return (
        <main className="container mx-auto flex min-h-[70dvh] items-center justify-center px-4 py-10">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Admin Page Sign-In</CardTitle>
                    <CardDescription>
                        Sign in to access the admin dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={signIn} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
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
                                autoComplete="current-password"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Sign In
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}

/**
 * Protected admin screen shown only when a valid session exists.
 * @returns Admin page content.
 */
export function AdminPage(): JSX.Element {
    return (
        <main className="container mx-auto px-4 py-10">
            <Card>
                {/* <CardHeader>
                    <CardTitle>Admin Page</CardTitle>
                    <CardDescription>
                        This screen is only available to authenticated users.
                    </CardDescription>
                </CardHeader> */}
                <CardContent>
                    <Button onClick={signOut}>Sign Out</Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Admin Page</CardTitle>
                    <CardDescription>
                        This screen is only available to authenticated users.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        Add your admin-only management tools here.
                    </p>
                </CardContent>
            </Card>
        </main>
    );
}

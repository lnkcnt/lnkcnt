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
import { AdminPageClient } from "./admin-page";

interface ReportItem {
    reportId: number;
    id: string;
    reason: string;
    message: string;
    ip: string;
    createdAt: string;
    redirectUrl: string;
}

interface LinkItem {
    id: string;
    redirectUrl: string;
    managePage: string | null;
}

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

/**
 * Fetch reports from database.
 * @returns List of reports ordered by latest first.
 */
async function getReports(): Promise<ReportItem[]> {
    try {
        const reports = await prisma.urlReport.findMany({
            orderBy: { createdAt: "desc" },
            take: 30,
            include: {
                links: {
                    select: {
                        redirect_url: true,
                    },
                },
            },
        });

        return reports.map((report) => ({
            reportId: report.reportId,
            id: report.id,
            reason: report.reason,
            message: report.message,
            ip: report.ip,
            createdAt: report.createdAt.toISOString(),
            redirectUrl: report.links.redirect_url,
        }));
    } catch (error) {
        console.error("Failed to fetch reports:", error);
        return [];
    }
}

/**
 * Fetch shortened links from database.
 * @returns List of shortened links with click counts.
 */
async function getLinks(): Promise<LinkItem[]> {
    try {
        const links = await prisma.links.findMany({
            orderBy: { id: "desc" },
            take: 50,
            include: {
                urlManagePage: {
                    select: { managePage: true },
                    take: 1,
                },
            },
        });

        return links.map((link) => ({
            id: link.id,
            redirectUrl: link.redirect_url,
            managePage: link.urlManagePage[0]?.managePage ?? null,
        }));
    } catch (error) {
        console.error("Failed to fetch links:", error);
        return [];
    }
}

async function deleteReport(reportId: number): Promise<void> {
    "use server";

    try {
        await prisma.urlReport.delete({ where: { reportId: reportId } });
    } catch (e) {
        console.log("Failed to delete report: " + e);
    }
}

/**
 * Add a URL pattern to the blocklist.
 * @param pattern - The URL pattern to block.
 * @param note - Optional note about why this pattern is blocked.
 */
async function blockURL(pattern: string, note: string): Promise<void> {
    "use server";

    const trimmedPattern = pattern.trim().toLowerCase();
    const trimmedNote = note.trim();

    if (!trimmedPattern) {
        throw new Error("Pattern is required");
    }

    if (trimmedPattern.length > 255) {
        throw new Error("Pattern must be 255 characters or fewer");
    }

    if (trimmedNote && trimmedNote.length > 255) {
        throw new Error("Note must be 255 characters or fewer");
    }

    try {
        await prisma.urlBlacklist.upsert({
            where: { pattern: trimmedPattern },
            create: {
                pattern: trimmedPattern,
                note: trimmedNote || null,
            },
            update: {
                note: trimmedNote || null,
            },
        });
    } catch (error) {
        console.error("Failed to add pattern to blocklist:", error);
        throw new Error("Failed to add pattern to blocklist");
    }
}

/**
 * Delete a shortened link.
 * @param linkId - The ID of the link to delete.
 */
async function deleteLink(linkId: string): Promise<void> {
    "use server";

    if (!linkId || linkId.trim().length === 0) {
        throw new Error("Link ID is required");
    }

    try {
        await prisma.links.delete({
            where: { id: linkId.trim() },
        });
    } catch (error) {
        console.error("Failed to delete link:", error);
        throw new Error("Failed to delete link");
    }
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
        const [reports, links] = await Promise.all([getReports(), getLinks()]);

        return (
            <AdminPageClient
                initialReports={reports}
                initialLinks={links}
                blockURL={blockURL}
                deleteLink={deleteLink}
                deleteReport={deleteReport}
            />
        );
    } else {
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
}

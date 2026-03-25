"use server";

import z from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

interface ResolveRedirectUrlResult {
    redirectUrl: string | null;
}

/**
 * Check if URL is in blacklist (DB)
 * @param url - URL to check against blacklist
 * @returns true if URL is blacklisted, false otherwise
 */
async function isBlacklisted(url: string): Promise<boolean> {
    const entries = await prisma.urlBlacklist.findMany({
        select: { pattern: true },
    });

    if (!entries.length) return false;

    let urlObj: URL;
    try {
        urlObj = new URL(url);
    } catch {
        return true;
    }

    const domain = urlObj.hostname.toLowerCase();
    const targetUrl = url.toLowerCase();

    return entries.some(({ pattern }) => {
        const normalizedPattern = pattern.trim().toLowerCase();
        if (!normalizedPattern) return false;
        return (
            domain.includes(normalizedPattern) ||
            targetUrl.includes(normalizedPattern)
        );
    });
}

/**
 * Resolve a short URL to a final redirect URL on server side
 * @param shortId - Short URL id
 * @returns redirectUrl when valid and allowed, otherwise null
 */
export async function resolveRedirectUrl(
    shortId: string,
): Promise<ResolveRedirectUrlResult> {
    try {
        const query = await prisma.links.findUnique({
            where: {
                id: shortId,
            },
            select: {
                redirect_url: true,
            },
        });

        const finalURL = query?.redirect_url;
        if (!finalURL) {
            return { redirectUrl: null };
        }

        const urlValidator = z.object({ url: z.httpUrl() });
        const urlValidationResult = urlValidator.safeParse({ url: finalURL });

        if (!urlValidationResult.success) {
            return { redirectUrl: null };
        }

        if (await isBlacklisted(finalURL)) {
            return { redirectUrl: null };
        }

        try {
            await prisma.linkClickCount.create({
                data: {
                    id: shortId,
                    date: new Date(),
                },
            });
        } catch (err) {
            // Click logging failure should not block redirect.
            console.error("Failed to log click:", err);
        }

        return { redirectUrl: finalURL };
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return { redirectUrl: null };
        }

        throw error;
    }
}

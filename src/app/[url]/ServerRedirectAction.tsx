"use server";

import { db } from "@/src/db";
import {
    linkClickCount,
    links,
    trustedURL,
    urlBlacklist,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";

interface ResolveRedirectUrlResult {
    redirectUrl: string | null;
    isTrusted?: boolean;
}

/**
 * Check if URL is in blacklist (DB)
 * @param url - URL to check against blacklist
 * @returns true if URL is blacklisted, false otherwise
 */
async function isBlacklisted(url: string): Promise<boolean> {
    const entries = await db
        .select({ pattern: urlBlacklist.pattern })
        .from(urlBlacklist);

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
 * Check URL is trusted.
 * @param url URL to check.
 * @returns true if URL is in trusted, otherwise false.
 */
async function isTrusted(url: string): Promise<boolean> {
    try {
        const baseUrl = new URL(url).hostname;

        const entries = await db
            .select({ url: trustedURL.url })
            .from(trustedURL)
            .where(eq(trustedURL.url, baseUrl));

        if (entries.length >= 1) {
            return true;
        } else {
            return false;
        }
    } catch (e) {
        console.error(`An error occurred when checking trust: ${e}`);
        return false;
    }
}

/**
 * Resolve a short URL to a final redirect URL on server side
 * @param shortId - Short URL id
 * @returns {ResolveRedirectUrlResult} redirectUrl: provided when valid and allowed, otherwise null / isTrusted: true when redirectUrl is trusted, otherwise false
 */
export async function resolveRedirectUrl(
    shortId: string,
): Promise<ResolveRedirectUrlResult> {
    try {
        const idValidator = z.object({ id: z.nanoid() });

        const idValidation = idValidator.safeParse({ id: shortId });
        if (!idValidation.success) {
            return { redirectUrl: null };
        }

        const query = (
            await db
                .selectDistinct({
                    redirect_url: links.redirectUrl,
                })
                .from(links)
                .where(eq(links.id, idValidation.data.id))
                .limit(1)
        ).at(0);
        if (!query) {
            return { redirectUrl: null };
        }
        const finalURL = query.redirect_url;

        const urlValidator = z.object({ url: z.httpUrl() });
        const urlValidationResult = urlValidator.safeParse({ url: finalURL });

        if (!urlValidationResult.success) {
            return { redirectUrl: null };
        }

        if (await isBlacklisted(finalURL)) {
            return { redirectUrl: null };
        }

        try {
            await db.insert(linkClickCount).values({
                id: idValidation.data.id,
                date: new Date(),
            });
        } catch (e) {
            // Click logging failure should not block redirect.
            console.error(
                "===== ERROR =====",
                "\nFailed to log click.",
                e,
                "\n=================",
            );
        }

        const isUrlTrusted = await isTrusted(finalURL);

        return {
            redirectUrl: finalURL,
            isTrusted: isUrlTrusted,
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

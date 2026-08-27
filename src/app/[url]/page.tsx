"use server";
import { notFound, redirect } from "next/navigation";
import RedirectionWarning from "./RedirectionWarning";

import { db } from "@/src/db";
import {
    linkClickCount,
    links,
    trustedUrl,
    urlBlacklist,
} from "@/src/db/schema";
import { eq } from "drizzle-orm";
import z from "zod";
import { Decoder } from "@valkey/valkey-glide";
import { getValkey } from "@/src/lib/valkey";
import { isRateLimited } from "@/src/lib/rate";

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
    const valkey = await getValkey();
    const valkeyRequest = await valkey.get(`cache:blacklist`);
    let existsInValkey = false;
    let urlObj: URL;
    try {
        urlObj = new URL(url);
    } catch {
        return true;
    }

    const domain = urlObj.hostname.toLowerCase();
    const targetUrl = url.toLowerCase();

    if (valkeyRequest) {
        const valkeyResponse: { pattern: string }[] = JSON.parse(
            valkeyRequest.toString(),
        );

        existsInValkey = valkeyResponse.some(({ pattern }) => {
            const normalizedPattern = pattern.trim().toLowerCase();
            if (!normalizedPattern) return false;
            return (
                domain.includes(normalizedPattern) ||
                targetUrl.includes(normalizedPattern)
            );
        });
    } else {
        existsInValkey = false;
    }

    if (existsInValkey) {
        return existsInValkey;
    } else {
        const entries = await db
            .select({ pattern: urlBlacklist.pattern })
            .from(urlBlacklist);

        if (!entries.length) return false;

        getValkey().then((valkey) => {
            valkey.set("cache:blacklist", JSON.stringify(entries));
        });

        return entries.some(({ pattern }) => {
            const normalizedPattern = pattern.trim().toLowerCase();
            if (!normalizedPattern) return false;
            return (
                domain.includes(normalizedPattern) ||
                targetUrl.includes(normalizedPattern)
            );
        });
    }
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
            .select({ url: trustedUrl.url })
            .from(trustedUrl)
            .where(eq(trustedUrl.url, baseUrl));

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
        const urlValidator = z.object({ url: z.httpUrl() });

        const idValidation = idValidator.safeParse({ id: shortId });
        if (!idValidation.success) {
            return { redirectUrl: null };
        }

        let finalURL: string = "";
        let existsInValkey: boolean = false;

        if (process.env.DISABLE_VALKEY) {
            existsInValkey = false;
        } else {
            try {
                const valkey = await getValkey();
                const valkeyResponse = await valkey.get(
                    `cache:url:${idValidation.data.id}`,
                    {
                        decoder: Decoder.String,
                    },
                );
                existsInValkey = valkeyResponse ? true : false;

                if (existsInValkey) {
                    finalURL = valkeyResponse as string;
                }
            } catch {
                existsInValkey = false;
            }
        }

        if (!existsInValkey) {
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
            finalURL = query.redirect_url;
        }

        const urlValidationResult = urlValidator.safeParse({ url: finalURL });
        if (!urlValidationResult.success) {
            return { redirectUrl: null };
        }

        const isUrlBlacklisted = await isBlacklisted(
            urlValidationResult.data.url,
        );
        const isUrlTrusted = await isTrusted(urlValidationResult.data.url);

        if (isUrlBlacklisted) {
            return { redirectUrl: null };
        }

        db.insert(linkClickCount)
            .values({
                id: idValidation.data.id,
            })
            .catch((e) => {
                // Click logging failure should not block redirect.
                console.error("ERROR: ", "Failed to log click.");
                console.error(e);
            });

        try {
            const valkey = await getValkey();
            valkey.set(
                `cache:url:${idValidation.data.id}`,
                urlValidationResult.data.url,
            );
        } catch (e) {
            console.warn("WARN: ", "Cannot connect to Valkey.");
            console.warn(e);
        }

        return {
            redirectUrl: urlValidationResult.data.url,
            isTrusted: isUrlTrusted,
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

/**
 * Server-side redirection page
 * @param params - Dynamic route params promise
 * @returns Loading UI while resolving the redirect target on server
 */
export default async function Redirection({
    params,
}: {
    params: Promise<{ url: string }>;
}) {
    if (await isRateLimited()) {
        return (
            <div className="flex flex-1 items-center justify-center text-4xl font-bold">
                Too Many Requests. Try again later.
            </div>
        );
    }

    const url = (await params).url;
    let isNotFound = false;
    let isTrusted = false;
    let isLoading = true;
    let redirectUrl = "";

    try {
        const result = await resolveRedirectUrl(url);

        if (!result.redirectUrl) {
            isNotFound = true;
            return;
        }

        if (result.isTrusted) {
            isTrusted = true;
        }

        redirectUrl = result.redirectUrl;
        isLoading = false;
    } catch {
        isNotFound = true;
    }

    if (isNotFound) {
        notFound();
    }

    if (isTrusted || isLoading) {
        redirect(redirectUrl);
    } else {
        return (
            <RedirectionWarning
                redirectUrl={redirectUrl}
                isTrusted={isTrusted}
            />
        );
    }
}

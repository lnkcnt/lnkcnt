import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import * as z from "zod";
import { db } from "@/src/db";
import { links, urlBlacklist, urlManagePage } from "@/src/db/schema";
import { isRateLimited, tooManyRequestsResponse } from "@/src/lib/rate";
import { ShortenResponse } from "@/src/types";
import { getValkey } from "@/src/lib/valkey";

/** Blacklist check result */
type URLBanData = {
    banned: boolean;
    note?: string | null;
};
type URLRequest = {
    url: string;
};

/**
 * Check if a URL matches any blacklist pattern.
 * @param url The URL to validate against blacklist entries.
 * @returns Blacklist result with `banned` flag and optional `note`.
 */
async function isBlacklisted(url: string): Promise<URLBanData> {
    const entries = await db
        .select({
            pattern: urlBlacklist.pattern,
            note: urlBlacklist.note,
        })
        .from(urlBlacklist);

    if (!entries.length) return { banned: false };

    const urlObj = new URL(url);
    const domain = urlObj.hostname.toLowerCase();
    const targetUrl = url.toLowerCase();

    let banNote: string | null | undefined;

    const isBanned = entries.some(({ pattern, note }) => {
        const p = pattern.trim().toLowerCase();
        if (!p) return false;
        if (domain.includes(p) || targetUrl.includes(p)) {
            banNote = note;
            return true;
        }
        return false;
    });

    return isBanned ? { banned: true, note: banNote } : { banned: false };
}

/**
 * Create a shortened URL.
 *
 * Route: `POST /api/url/shorten`
 * Expects a JSON body with `url`.
 * Returns:
 * - 201 with `generatedId` and `managePage` when created
 * - 400 for invalid JSON body
 * - 422 when URL validation fails
 * - 403 when the URL matches a blacklist rule
 *
 * @param request Incoming Next.js request with JSON body.
 * @returns JSON response describing creation result or validation errors.
 */
export async function POST(
    request: NextRequest,
): Promise<NextResponse<ShortenResponse>> {
    if (await isRateLimited()) {
        return tooManyRequestsResponse();
    }

    const URLSchema = z.object({
        url: z.httpUrl(),
    });

    let body: URLRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid JSON body",
                errors: { errors: ["Invalid request body"], properties: {} },
            },
            { status: 400 },
        );
    }

    const validatedFields = URLSchema.safeParse(body);

    if (!validatedFields.success) {
        const flatErrors = z.flattenError(validatedFields.error);
        return NextResponse.json(
            {
                success: false,
                message: "URL is invalid",
                errors: {
                    errors: flatErrors.formErrors,
                    properties: flatErrors.fieldErrors,
                },
            },
            { status: 422 },
        );
    }

    const banData = await isBlacklisted(validatedFields.data.url);
    if (banData.banned) {
        return NextResponse.json(
            {
                success: false,
                message: "This URL is not allowed",
                errors: {
                    errors: [banData.note ?? "No reason specified"],
                    properties: {},
                },
            },
            { status: 403 },
        );
    }

    const valkey = await getValkey();
    const generatedId = nanoid();
    const managePage = nanoid(32);

    await db
        .insert(links)
        .values({ id: generatedId, redirectUrl: validatedFields.data.url });
    await db.insert(urlManagePage).values({ id: generatedId, managePage });

    return NextResponse.json(
        {
            message: "URL generated successfully.",
            success: true,
            generatedId,
            managePage,
        },
        { status: 201 },
    );
}

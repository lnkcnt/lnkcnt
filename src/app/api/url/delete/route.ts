"use server";

import { db } from "@/src/db";
import { links, urlManagePage } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

type DeleteResponse = {
    success: boolean;
    message: string;
};

/**
 * Delete a shortened URL by management page token.
 *
 * Route: `POST /api/url/delete`
 * Expects a JSON body with `id` (management page token).
 * Returns:
 * - 200 when deletion succeeds
 * - 400 for invalid JSON body
 * - 404 when token is not found
 * - 500 for unexpected server errors
 *
 * @param request Incoming Next.js request containing JSON body.
 * @returns JSON response describing deletion result.
 */
export async function POST(
    request: NextRequest,
): Promise<NextResponse<DeleteResponse>> {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            {
                success: false,
                message: "Invalid JSON body",
            },
            { status: 400 },
        );
    }

    try {
        const idValidator = z.object({
            id: z.string().regex(/^[a-z0-9_-]{32}$/i),
        });

        const idValidation = idValidator.safeParse({ id: body.id });

        if (!idValidation.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid ID",
                },
                { status: 400 },
            );
        }
        const managePage = (
            await db
                .select()
                .from(urlManagePage)
                .where(eq(urlManagePage.managePage, idValidation.data.id))
                .limit(1)
        ).at(0);

        if (!managePage) {
            return NextResponse.json(
                {
                    success: false,
                    message: "ID not found",
                },
                { status: 404 },
            );
        }

        // 링크 삭제
        await db.delete(links).where(eq(links.id, managePage.id));
        return NextResponse.json({
            success: true,
            message: "Successfully deleted",
        });
    } catch {
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 },
        );
    }
}

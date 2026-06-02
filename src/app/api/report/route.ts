import { db } from "@/src/db";
import { links, urlReport } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

/**
 * Validation object for user forms.
 */
const formValidator = z.object({
    id: z.nanoid().trim(),
    reason: z.enum([
        "phishing",
        "malware",
        "spam",
        "redirectloop",
        "unaccessible",
        "adult",
        "harassment",
        "violence",
        "illegal",
        "other",
    ]),
    message: z.string().trim().min(1).max(300),
});

/**
 * Handle URL abuse report submission.
 *
 * Expects a JSON body with `id`, `reason`, and `message`.
 * Returns:
 * - 200 with `{ success: true, reportId }` on success
 * - 400 when required fields are missing
 * - 404 when the target link is not found
 * - 500 for unexpected server errors
 *
 * @param request Incoming Next.js request containing report payload.
 * @returns JSON response describing the result of report creation.
 */
export async function POST(request: NextRequest) {
    try {
        const { id, reason, message } = await request.json();

        // 필수 필드 검증
        if (!id || !reason || !message) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 },
            );
        }

        // 필드 유효성 검사
        const formValidation = formValidator.safeParse({
            id,
            reason,
            message,
        });
        if (!formValidation.success) {
            return NextResponse.json(
                { success: false, error: "Invalid values" },
                { status: 400 },
            );
        }

        // 링크 존재 여부 확인
        const link = (
            await db
                .selectDistinct()
                .from(links)
                .where(eq(links.id, formValidation.data.id))
                .limit(1)
        ).at(0);

        if (!link) {
            return NextResponse.json(
                { success: false, error: "Link not found" },
                { status: 404 },
            );
        }

        // 신고 저장
        const insertResult = await db
            .insert(urlReport)
            .values({
                id: formValidation.data.id,
                reason: formValidation.data.reason,
                message: formValidation.data.message,
            })
            .returning();

        const report = insertResult[0]?.reportId;

        if (!report) {
            throw new Error();
        }

        return NextResponse.json({
            success: true,
            reportId: report,
        });
    } catch {
        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
            },
            { status: 500 },
        );
    }
}

import { prisma } from "@/lib/prisma";
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
                { error: "Missing required fields" },
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
                { error: "Invalid values" },
                { status: 400 },
            );
        }

        // 링크 존재 여부 확인
        const link = await prisma.links.findUnique({
            where: { id: formValidation.data.id },
        });

        if (!link) {
            return NextResponse.json(
                { error: "Link not found" },
                { status: 404 },
            );
        }

        // 신고 저장
        const report = await prisma.urlReport.create({
            data: {
                id: formValidation.data.id,
                reason: formValidation.data.reason,
                message: formValidation.data.message,
            },
        });

        return NextResponse.json({
            success: true,
            reportId: report.reportId,
        });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

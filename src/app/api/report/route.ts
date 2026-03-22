import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

        // 링크 존재 여부 확인
        const link = await prisma.links.findUnique({
            where: { id },
        });

        if (!link) {
            return NextResponse.json(
                { error: "Link not found" },
                { status: 404 },
            );
        }

        // IP 주소 가져오기
        const ip =
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown";

        // 신고 저장
        const report = await prisma.urlReport.create({
            data: {
                id,
                reason,
                message,
                ip,
            },
        });

        return NextResponse.json({
            success: true,
            reportId: report.reportId,
        });
    } catch (error) {
        console.error("Error submitting report:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

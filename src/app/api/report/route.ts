import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST handler for submitting URL report
 * @param request - NextRequest object containing report data
 * @returns JSON response with result or error
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

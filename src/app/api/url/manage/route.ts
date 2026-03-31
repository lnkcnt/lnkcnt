import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Fetch link details and click history by management page token.
 *
 * Route: `GET /api/url/manage?id=<managePageToken>`
 * Returns:
 * - 200 with link metadata and click records
 * - 400 when `id` query parameter is missing
 * - 404 when manage page token or link data is not found
 * - 500 for unexpected server errors
 *
 * @param request Incoming Next.js request containing query parameters.
 * @returns JSON response with link information or an error payload.
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({
                message: "Bad Request: id required",
                status: 400,
            });
        }

        // Find the management page entry by managePage field
        const managePage = await prisma.urlManagePage.findFirst({
            where: {
                managePage: id,
            },
        });

        if (!managePage) {
            return NextResponse.json(
                { error: "Link not found" },
                { status: 404 },
            );
        }

        // Fetch the corresponding link data with click counts
        const linkData = await prisma.links.findUnique({
            where: {
                id: managePage.id,
            },
        });

        if (!linkData) {
            return NextResponse.json(
                { error: "Link data not found" },
                { status: 404 },
            );
        }

        // 집계 쿼리로 클릭 수 가져오기
        const clickCount = await prisma.linkClickCount.count({
            where: { id: managePage.id },
        });

        // 클릭 상세 정보도 필요하면 따로 조회
        const clicks = await prisma.linkClickCount.findMany({
            where: { id: managePage.id },
            select: { date: true },
        });

        return NextResponse.json({
            id: linkData.id,
            redirect_url: linkData.redirect_url,
            click_count: clickCount,
            clicks,
        });
    } catch {
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}

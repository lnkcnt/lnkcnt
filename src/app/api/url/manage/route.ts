import { db } from "@/src/db";
import { linkClickCount, links, urlManagePage } from "@/src/db/schema";
import { isRateLimited } from "@/src/lib/rate";
import { count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

type ManageResponse = {
    success: boolean;
    message: string;
    id?: string;
    redirect_url?: string;
    click_count?: number;
    clicks?: {
        date: Date;
    }[];
};

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
export async function GET(
    request: NextRequest,
): Promise<NextResponse<ManageResponse>> {
    if (await isRateLimited()) {
        return NextResponse.json(
            {
                success: false,
                message: "Too Many Requests. Try again tomorrow.",
            },
            { status: 429 },
        );
    }

    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Bad Request: id required",
                },
                { status: 400 },
            );
        }

        // Find the management page entry by managePage field
        const managePage = (
            await db
                .select()
                .from(urlManagePage)
                .where(eq(urlManagePage.managePage, id))
        ).at(0);

        if (!managePage) {
            return NextResponse.json(
                { success: false, message: "Link not found" },
                { status: 404 },
            );
        }

        const linkData = (
            await db.select().from(links).where(eq(links.id, managePage.id))
        ).at(0);

        if (!linkData) {
            return NextResponse.json(
                { success: false, message: "Link data not found" },
                { status: 404 },
            );
        }

        // 집계 쿼리로 클릭 수 가져오기
        const clickCount = (
            await db
                .select({ count: count() })
                .from(linkClickCount)
                .where(eq(linkClickCount.id, managePage.id))
        ).at(0);

        // 클릭 상세 정보도 필요하면 따로 조회
        const clicks = await db
            .select({ date: linkClickCount.date })
            .from(linkClickCount)
            .where(eq(linkClickCount.id, managePage.id));

        return NextResponse.json({
            success: true,
            message: "Request successful.",
            id: linkData.id,
            redirect_url: linkData.redirectUrl,
            click_count: clickCount?.count ?? 0,
            clicks: clicks,
        });
    } catch {
        return NextResponse.json(
            {
                success: false,
                message: "Internal server error",
            },
            { status: 500 },
        );
    }
}

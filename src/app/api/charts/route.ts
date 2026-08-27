import { db } from "@/src/db";
import { linkClickCount } from "@/src/db/schema";
import { isRateLimited, tooManyRequestsResponse } from "@/src/lib/rate";
import { ChartsResponse } from "@/src/types";
import { and, eq, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

/**
 * Return daily click aggregates for a link within a date range.
 *
 * Route: `GET /api/charts`
 * Query parameters:
 * - `id` (required): shortened link id
 * - `startYear` and `startMonth` (required): start period
 * - `endYear` and `endMonth` (optional): end period
 *
 * Returns:
 * - 200 with `{ data: Array<{ date: string, sum: number }> }`
 * - 400 when required query parameters are missing
 *
 * @param request Incoming Next.js request containing chart query parameters.
 * @returns JSON response with aggregated click data.
 */
export async function GET(
    request: NextRequest,
): Promise<NextResponse<ChartsResponse>> {
    if (await isRateLimited()) {
        return tooManyRequestsResponse;
    }

    const searchParams = request.nextUrl.searchParams;
    const startYear = searchParams.get("startYear");
    const startMonth = searchParams.get("startMonth");
    const endYear = searchParams.get("endYear");
    const endMonth = searchParams.get("endMonth");
    const id = searchParams.get("id");

    let startDate: Date;

    if (!id) {
        return NextResponse.json(
            {
                success: false,
                message: "Bad Request: id required",
            },
            { status: 400 },
        );
    }

    if (startYear && startMonth) {
        // 시작일과 종료일 계산
        startDate = new Date(
            Number.parseInt(startYear),
            Number.parseInt(startMonth),
            1,
        );
    } else {
        return NextResponse.json(
            {
                success: false,
                message: "Bad Request: startYear and startMonth is required",
            },
            { status: 400 },
        );
    }

    let endDate: Date;

    if (endYear && endMonth) {
        endDate = new Date(
            Number.parseInt(endYear),
            Number.parseInt(endMonth),
            31,
            23,
            59,
            59,
            999,
        ); // 해당 월의 마지막 순간
    } else {
        const currentDate = new Date();
        endDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate(),
            23,
            59,
            59,
            999,
        );
    }

    // ORM을 사용하여 기간 내의 모든 클릭 데이터 가져오기
    const clicks = await db
        .select({ date: linkClickCount.date })
        .from(linkClickCount)
        .where(
            and(
                eq(linkClickCount.id, id),
                gte(linkClickCount.date, startDate),
                lte(linkClickCount.date, endDate),
            ),
        )
        .orderBy(linkClickCount.date);

    // JavaScript로 일별 그룹화 및 집계
    const dailyData = new Map<string, number>();

    clicks.forEach((click) => {
        const date = new Date(click.date);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dayKey = `${year}-${month}-${day}`;

        dailyData.set(dayKey, (dailyData.get(dayKey) || 0) + 1);
    });

    // Map을 배열로 변환하고 날짜순 정렬
    const data = Array.from(dailyData.entries())
        .map(([date, sum]) => ({ date, sum }))
        .sort((a, b) => a.date.localeCompare(b.date));
    // 정리된 데이터를 NextResponse로 반환
    return NextResponse.json({
        success: true,
        message: "Successful.",
        data: data,
    });
}

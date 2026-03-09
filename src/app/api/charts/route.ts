import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * 지정된 기간 동안의 링크 클릭 수를 일별로 집계하여 반환합니다.
 * @param startYear 시작 연도
 * @param startMonth 시작 월 (1-12)
 * @param endYear 종료 연도
 * @param endMonth 종료 월 (1-12)
 * @returns 일별 클릭 수 집계 데이터 배열 [{ date: "YYYY-MM-DD", sum: number }]
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const startYear = searchParams.get("startYear");
    const startMonth = searchParams.get("startMonth");
    const endYear = searchParams.get("endYear");
    const endMonth = searchParams.get("endMonth");
    const id = searchParams.get("id");

    let startDate: Date;

    if (!id) {
        return NextResponse.json({
            message: "Bad Request: id required",
            status: 400,
        });
    }

    if (startYear && startMonth) {
        // 시작일과 종료일 계산
        startDate = new Date(
            Number.parseInt(startYear),
            Number.parseInt(startMonth),
            1,
        );
    } else {
        return NextResponse.json({
            message: "Bad Request: startYear and startMonth is required",
            status: 400,
        });
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

    // Prisma ORM을 사용하여 기간 내의 모든 클릭 데이터 가져오기
    const clicks = await prisma.linkClickCount.findMany({
        where: {
            id: id,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            date: true,
        },
        orderBy: {
            date: "asc",
        },
    });

    // JavaScript로 일별 그룹화 및 집계
    const dailyData = new Map<string, number>();

    clicks.forEach((click) => {
        const year = click.date.getFullYear();
        const month = String(click.date.getMonth() + 1).padStart(2, "0");
        const day = String(click.date.getDate()).padStart(2, "0");
        const dayKey = `${year}-${month}-${day}`;

        dailyData.set(dayKey, (dailyData.get(dayKey) || 0) + 1);
    });

    // Map을 배열로 변환하고 날짜순 정렬
    const data = Array.from(dailyData.entries())
        .map(([date, sum]) => ({ date, sum }))
        .sort((a, b) => a.date.localeCompare(b.date));
    // 정리된 데이터를 NextResponse로 반환
    return NextResponse.json({
        data: data,
    });
}

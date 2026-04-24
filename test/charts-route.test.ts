import { beforeEach, describe, expect, test, vi } from "vitest";

const chartsState = vi.hoisted(() => ({
    clickRows: [] as Array<{ date: Date }>,
}));

vi.mock("@/src/db", () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    orderBy: vi.fn(async () => chartsState.clickRows),
                })),
            })),
        })),
    },
}));

import { GET } from "../src/app/api/charts/route";
import type { NextRequest } from "next/server";

function createRequest(query: Record<string, string>) {
    const searchParams = new URLSearchParams(query);
    return {
        nextUrl: {
            searchParams,
        },
    } as NextRequest;
}

describe("GET /api/charts", () => {
    beforeEach(() => {
        chartsState.clickRows = [];
        vi.clearAllMocks();
    });

    test("returns bad request payload when id is missing", async () => {
        const response = await GET(
            createRequest({ startYear: "2026", startMonth: "0" }) as never,
        );
        const payload = (await response.json()) as {
            message: string;
            status: number;
        };

        expect(payload).toEqual({
            message: "Bad Request: id required",
            status: 400,
        });
    });

    test("returns bad request payload when startYear or startMonth is missing", async () => {
        const response = await GET(createRequest({ id: "abc123" }) as never);
        const payload = (await response.json()) as {
            message: string;
            status: number;
        };

        expect(payload).toEqual({
            message: "Bad Request: startYear and startMonth is required",
            status: 400,
        });
    });

    test("aggregates clicks by day", async () => {
        chartsState.clickRows = [
            { date: new Date(2026, 0, 1, 10, 0, 0, 0) },
            { date: new Date(2026, 0, 1, 23, 0, 0, 0) },
            { date: new Date(2026, 0, 2, 5, 0, 0, 0) },
        ];

        const response = await GET(
            createRequest({
                id: "abc123",
                startYear: "2026",
                startMonth: "0",
                endYear: "2026",
                endMonth: "0",
            }) as never,
        );
        const payload = (await response.json()) as {
            data: Array<{ date: string; sum: number }>;
        };

        expect(payload.data).toEqual([
            { date: "2026-01-01", sum: 2 },
            { date: "2026-01-02", sum: 1 },
        ]);
    });
});

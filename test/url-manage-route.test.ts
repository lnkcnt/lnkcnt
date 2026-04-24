import { beforeEach, describe, expect, test, vi } from "vitest";

const manageState = vi.hoisted(() => ({
    selectResults: [] as unknown[],
    selectCallCount: 0,
    throwOnSelect: false,
}));

vi.mock("@/src/db", () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(async () => {
                    if (manageState.throwOnSelect) {
                        throw new Error("query failed");
                    }

                    const result = manageState.selectResults.at(
                        manageState.selectCallCount,
                    );
                    manageState.selectCallCount += 1;
                    return result ?? [];
                }),
            })),
        })),
    },
}));

import { GET } from "../src/app/api/url/manage/route";
import { NextRequest } from "next/server";

function createRequest(query: Record<string, string>) {
    const searchParams = new URLSearchParams(query);
    return {
        nextUrl: {
            searchParams,
        },
    } as NextRequest;
}

describe("GET /api/url/manage", () => {
    beforeEach(() => {
        manageState.selectResults = [];
        manageState.selectCallCount = 0;
        manageState.throwOnSelect = false;
        vi.clearAllMocks();
    });

    test("returns bad request payload when id is missing", async () => {
        const response = await GET(createRequest({}) as never);
        const payload = (await response.json()) as {
            message: string;
            status: number;
        };

        expect(payload).toEqual({
            message: "Bad Request: id required",
            status: 400,
        });
    });

    test("returns 404 when manage page is not found", async () => {
        manageState.selectResults = [[]];

        const response = await GET(
            createRequest({ id: "manage-page" }) as never,
        );
        const payload = (await response.json()) as { error: string };

        expect(response.status).toBe(404);
        expect(payload.error).toBe("Link not found");
    });

    test("returns 404 when link data is missing", async () => {
        manageState.selectResults = [
            [{ id: "link-id-1", managePage: "token" }],
            [],
        ];

        const response = await GET(
            createRequest({ id: "manage-page" }) as never,
        );
        const payload = (await response.json()) as { error: string };

        expect(response.status).toBe(404);
        expect(payload.error).toBe("Link data not found");
    });

    test("returns link data and click details", async () => {
        manageState.selectResults = [
            [{ id: "link-id-1", managePage: "token" }],
            [{ id: "link-id-1", redirectUrl: "https://example.com" }],
            [{ count: 3 }],
            [{ date: new Date("2026-01-01T00:00:00.000Z") }],
        ];

        const response = await GET(
            createRequest({ id: "manage-page" }) as never,
        );
        const payload = (await response.json()) as {
            id: string;
            redirect_url: string;
            click_count: number;
            clicks: Array<{ date: string }>;
        };

        expect(response.status).toBe(200);
        expect(payload.id).toBe("link-id-1");
        expect(payload.redirect_url).toBe("https://example.com");
        expect(payload.click_count).toBe(3);
        expect(payload.clicks).toHaveLength(1);
    });

    test("returns 500 when query throws", async () => {
        manageState.throwOnSelect = true;

        const response = await GET(
            createRequest({ id: "manage-page" }) as never,
        );
        const payload = (await response.json()) as { error: string };

        expect(response.status).toBe(500);
        expect(payload.error).toBe("Internal server error");
    });
});

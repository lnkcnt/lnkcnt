import { beforeEach, describe, expect, test, vi } from "vitest";

type BlacklistRow = {
    pattern: string;
    note?: string | null;
};

type InsertRecord = {
    tableName: string;
    values: unknown;
};

const routeState = vi.hoisted(() => ({
    blacklistRows: [] as BlacklistRow[],
    insertRecords: [] as InsertRecord[],
    nanoidLengths: [] as Array<number | undefined>,
}));

vi.mock("nanoid", () => ({
    nanoid: vi.fn((size?: number) => {
        routeState.nanoidLengths.push(size);

        if (size === 32) {
            return "manage-page-id";
        }

        return "generated-link-id";
    }),
}));

const { mockValkey } = vi.hoisted(() => ({
    mockValkey: {
        set: vi.fn(async () => "OK" as const),
    },
}));

vi.mock("@/src/lib/valkey", () => ({
    getValkey: vi.fn(() => Promise.resolve(mockValkey)),
}));

vi.mock("@/src/lib/rate", () => ({
    isRateLimited: () => false,
    tooManyRequestsResponse: () =>
        NextResponse.json(
            {
                success: false,
                message: "Too Many Requests. Try again later.",
                reportId: undefined,
            },
            { status: 429 },
        ),
}));

vi.mock("@/src/db", () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(async () => routeState.blacklistRows),
        })),
        insert: vi.fn((table: { [key: string]: unknown }) => ({
            values: vi.fn(async (values: unknown) => {
                routeState.insertRecords.push({
                    tableName: String(table?.name ?? "unknown"),
                    values,
                });
            }),
        })),
    },
}));

import { POST } from "@/src/app/api/url/shorten/route";
import { NextResponse } from "next/server";

function createRequest(body: unknown) {
    return {
        json: async () => body,
    } as Request;
}

describe("POST /api/url/shorten", () => {
    beforeEach(() => {
        routeState.blacklistRows = [];
        routeState.insertRecords = [];
        routeState.nanoidLengths = [];
        vi.clearAllMocks();
    });

    test("returns 400 when the body is not valid JSON", async () => {
        const request = {
            json: async () => {
                throw new Error("invalid json");
            },
        };

        const response = await POST(request as never);
        const payload = (await response.json()) as {
            message: string;
            errors: { errors: string[] };
        };

        expect(response.status).toBe(400);
        expect(payload.message).toBe("Invalid JSON body");
        expect(payload.errors.errors).toContain("Invalid request body");
    });

    test("returns 422 for invalid URLs", async () => {
        const response = await POST(
            createRequest({ url: "not-a-url" }) as never,
        );
        const payload = (await response.json()) as { message: string };

        expect(response.status).toBe(422);
        expect(payload.message).toBe("URL is invalid");
    });

    test("returns 403 when the URL matches a blacklist pattern", async () => {
        routeState.blacklistRows = [
            { pattern: "blocked.example", note: "Blocked" },
        ];

        const response = await POST(
            createRequest({ url: "https://blocked.example/path" }) as never,
        );
        const payload = (await response.json()) as {
            message: string;
            errors: { errors: string[] };
        };

        expect(response.status).toBe(403);
        expect(payload.message).toBe("This URL is not allowed");
        expect(payload.errors.errors).toEqual(["Blocked"]);
        expect(routeState.insertRecords).toHaveLength(0);
    });

    test("creates a short URL when the input is valid", async () => {
        const response = await POST(
            createRequest({ url: "https://example.com/articles/1" }) as never,
        );
        const payload = (await response.json()) as {
            message: string;
            success: boolean;
            generatedId: string;
            managePage: string;
        };

        expect(response.status).toBe(201);
        expect(payload).toEqual({
            message: "URL generated successfully.",
            success: true,
            generatedId: "generated-link-id",
            managePage: "manage-page-id",
        });
        expect(routeState.nanoidLengths).toEqual([undefined, 32]);
        expect(routeState.insertRecords).toHaveLength(2);
        expect(routeState.insertRecords[0]?.values).toEqual({
            id: "generated-link-id",
            redirectUrl: "https://example.com/articles/1",
        });
        expect(routeState.insertRecords[1]?.values).toEqual({
            id: "generated-link-id",
            managePage: "manage-page-id",
        });
    });
});

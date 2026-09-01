import { POST } from "@/src/app/api/report/route";
import { ReportResponse } from "@/src/types";
import { NextResponse, type NextRequest } from "next/server";
import { beforeEach, describe, expect, test, vi } from "vitest";

const reportState = vi.hoisted(() => ({
    linkRows: [] as Array<{ id: string }>,
    returningRows: [] as Array<{ reportId: number }>,
    insertedValues: [] as unknown[],
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
        selectDistinct: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(async () => reportState.linkRows),
                })),
            })),
        })),
        insert: vi.fn(() => ({
            values: vi.fn((values: unknown) => {
                reportState.insertedValues.push(values);
                return {
                    returning: vi.fn(async () => reportState.returningRows),
                };
            }),
        })),
    },
}));

function createRequest(body: unknown) {
    return {
        json: async () => body,
    } as NextRequest;
}

describe("POST /api/report", () => {
    beforeEach(() => {
        reportState.linkRows = [];
        reportState.returningRows = [];
        reportState.insertedValues = [];
        vi.clearAllMocks();
    });

    test("returns 400 when required fields are missing", async () => {
        const response = await POST(createRequest({ id: "id-only" }) as never);
        const payload = (await response.json()) as ReportResponse;

        expect(response.status).toBe(400);
        expect(payload.message).toBe("Missing required fields");
    });

    test("returns 400 when validation fails", async () => {
        const response = await POST(
            createRequest({
                id: "invalid-id",
                reason: "spam",
                message: "message",
            }) as never,
        );
        const payload = (await response.json()) as ReportResponse;

        expect(response.status).toBe(400);
        expect(payload.message).toBe("Invalid values");
    });

    test("returns 404 when the target link does not exist", async () => {
        const response = await POST(
            createRequest({
                id: "V1StGXR8_Z5jdHi6B-myT",
                reason: "spam",
                message: "report message",
            }) as never,
        );
        const payload = (await response.json()) as ReportResponse;

        expect(response.status).toBe(404);
        expect(payload.message).toBe("Link not found");
    });

    test("creates a report when payload is valid", async () => {
        reportState.linkRows = [{ id: "V1StGXR8_Z5jdHi6B-myT" }];
        reportState.returningRows = [{ reportId: 11 }];

        const response = await POST(
            createRequest({
                id: "V1StGXR8_Z5jdHi6B-myT",
                reason: "spam",
                message: "report message",
            }) as never,
        );
        const payload = (await response.json()) as ReportResponse;

        expect(response.status).toBe(200);
        expect(payload).toEqual({
            success: true,
            reportId: 11,
            message: "Successfully reported.",
        });
        expect(reportState.insertedValues).toContainEqual({
            id: "V1StGXR8_Z5jdHi6B-myT",
            reason: "spam",
            message: "report message",
        });
    });

    test("returns 500 when request parsing throws", async () => {
        const response = await POST({
            json: async () => {
                throw new SyntaxError();
            },
        } as never);
        const payload = (await response.json()) as ReportResponse;

        expect(response.status).toBe(500);
        expect(payload.message).toBe("Internal server error");
    });
});

import { beforeEach, describe, expect, test, vi } from "vitest";

const deleteState = vi.hoisted(() => ({
    managePageRows: [] as Array<{ id: string; managePage: string }>,
    deleteWhereCallCount: 0,
    throwOnDelete: false,
}));

vi.mock("@/src/db", () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(async () => deleteState.managePageRows),
                })),
            })),
        })),
        delete: vi.fn(() => ({
            where: vi.fn(async () => {
                if (deleteState.throwOnDelete) {
                    throw new Error("delete failed");
                }

                deleteState.deleteWhereCallCount += 1;
            }),
        })),
    },
}));

import { POST } from "@/src/app/api/url/delete/route";

function createRequest(body: unknown) {
    return {
        json: async () => body,
    } as Request;
}

describe("POST /api/url/delete", () => {
    beforeEach(() => {
        deleteState.managePageRows = [];
        deleteState.deleteWhereCallCount = 0;
        deleteState.throwOnDelete = false;
        vi.clearAllMocks();
    });

    test("returns 400 when request body is invalid JSON", async () => {
        const response = await POST({
            json: async () => {
                throw new SyntaxError();
            },
        } as never);
        const payload = (await response.json()) as { message: string };

        expect(response.status).toBe(400);
        expect(payload.message).toBe("Invalid JSON body");
    });

    test("returns 400 for invalid id format", async () => {
        const response = await POST(createRequest({ id: "bad-id" }) as never);
        const payload = (await response.json()) as { message: string };

        expect(response.status).toBe(400);
        expect(payload.message).toBe("Invalid ID");
    });

    test("returns 404 when id does not exist", async () => {
        const response = await POST(
            createRequest({ id: "a".repeat(32) }) as never,
        );
        const payload = (await response.json()) as { message: string };

        expect(response.status).toBe(404);
        expect(payload.message).toBe("ID not found");
    });

    test("deletes a link when id exists", async () => {
        deleteState.managePageRows = [
            {
                id: "link-id-1",
                managePage: "a".repeat(32),
            },
        ];

        const response = await POST(
            createRequest({ id: "a".repeat(32) }) as never,
        );
        const payload = (await response.json()) as {
            success: boolean;
            message: string;
        };

        expect(response.status).toBe(200);
        expect(payload).toEqual({
            success: true,
            message: "Successfully deleted",
        });
        expect(deleteState.deleteWhereCallCount).toBe(1);
    });

    test("returns 500 when delete throws", async () => {
        deleteState.managePageRows = [
            {
                id: "link-id-1",
                managePage: "a".repeat(32),
            },
        ];
        deleteState.throwOnDelete = true;

        const response = await POST(
            createRequest({ id: "a".repeat(32) }) as never,
        );
        const payload = (await response.json()) as { message: string };

        expect(response.status).toBe(500);
        expect(payload.message).toBe("Internal server error");
    });
});

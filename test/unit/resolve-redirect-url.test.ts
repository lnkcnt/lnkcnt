import { beforeEach, describe, expect, test, vi } from "vitest";
import { resolveRedirectUrl } from "@/src/app/[url]/page";
import { DecoderOption, GlideString, SetOptions } from "@valkey/valkey-glide";

const state = vi.hoisted(() => ({
    linksRows: [] as Array<{ redirect_url: string }>,
    blacklistRows: [] as Array<{ pattern: string; note?: string | null }>,
    trustedRows: [] as Array<{ url: string }>,
    insertRecords: [] as Array<unknown>,
    throwOnInsert: false,
}));

const { mockValkey } = vi.hoisted(() => ({
    mockValkey: {
        get: vi.fn<
            (
                key: GlideString,
                options?: DecoderOption,
            ) => Promise<GlideString | null>
        >(),
        set: vi.fn<
            (
                key: GlideString,
                value: GlideString,
                options?: SetOptions & DecoderOption,
            ) => Promise<"OK" | GlideString | null>
        >(),
    },
}));

vi.mock("@/src/db", () => ({
    db: {
        selectDistinct: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    limit: vi.fn(async () => state.linksRows),
                })),
            })),
        })),
        select: vi.fn((selection: { pattern?: unknown; url?: unknown }) => ({
            from: vi.fn(() => {
                if (selection.url !== undefined) {
                    return Promise.resolve(state.trustedRows);
                }

                // Return a thenable that resolves to blacklistRows when awaited,
                // but also expose a .where(...).limit(...) chain for trustedURL queries.
                type ThenableResult = {
                    then: (resolve: (val: unknown) => void) => void;
                    where?: unknown;
                };

                const thenable: ThenableResult = {
                    then: (resolve) => {
                        resolve(state.blacklistRows);
                    },
                };

                thenable.where = vi.fn(() => {
                    const w: ThenableResult & {
                        limit: (
                            ...args: unknown[]
                        ) => Promise<typeof state.trustedRows>;
                    } = {
                        then: (resolve) => {
                            resolve(state.trustedRows);
                        },
                        limit: async () => state.trustedRows,
                    };
                    return w;
                });

                return thenable;
            }),
        })),
        insert: vi.fn(() => ({
            values: vi.fn(async (values: unknown) => {
                if (state.throwOnInsert) throw new Error("insert failed");
                state.insertRecords.push(values);
            }),
        })),
    },
}));

vi.mock("@/src/lib/valkey", () => ({
    getValkey: vi.fn(() => Promise.resolve(mockValkey)),
}));

describe("resolveRedirectUrl", () => {
    beforeEach(() => {
        state.linksRows = [];
        state.blacklistRows = [];
        state.trustedRows = [];
        state.insertRecords = [];
        state.throwOnInsert = false;
        vi.clearAllMocks();
    });

    test("returns null for invalid id format", async () => {
        const result = await resolveRedirectUrl("bad-id");
        expect(result.redirectUrl).toBeNull();
    });

    test("returns null when link not found", async () => {
        state.linksRows = [];
        mockValkey.get.mockResolvedValue(null);

        const result = await resolveRedirectUrl("a".repeat(21));
        expect(result.redirectUrl).toBeNull();
    });

    test("returns null when stored URL is not HTTP/HTTPS", async () => {
        state.linksRows = [{ redirect_url: "ftp://example.com/resource" }];
        mockValkey.get.mockResolvedValue("ftp://example.com/resource");

        const result = await resolveRedirectUrl("a".repeat(21));
        expect(result.redirectUrl).toBeNull();
    });

    test("returns null when URL matches blacklist pattern", async () => {
        state.linksRows = [{ redirect_url: "https://bad.example/path" }];
        // mockValkey.get.mockResolvedValue("https://bad.example/path");
        mockValkey.get.mockImplementation(async (key) => {
            if (key === "cache:blacklist") {
                return JSON.stringify([{ pattern: "bad.example" }]);
            } else {
                return null;
            }
        });
        state.blacklistRows = [{ pattern: "bad.example", note: "Blocked" }];

        const result = await resolveRedirectUrl("a".repeat(21));
        expect(result.redirectUrl).toBeNull();
    });

    test("returns redirectUrl and isTrusted, and logs a click", async () => {
        state.linksRows = [{ redirect_url: "https://good.example/articles/1" }];
        mockValkey.get.mockImplementation(async (key) => {
            if (key === `cache:url:${"a".repeat(21)}`) {
                return "https://good.example/articles/1";
            } else if (key === "cache:trust") {
                return '[{"url": "good.example"}]';
            }

            return null;
        });
        state.blacklistRows = [];
        state.trustedRows = [{ url: "good.example" }];

        const result = await resolveRedirectUrl("a".repeat(21));

        expect(result.redirectUrl).toBe("https://good.example/articles/1");
        expect(result.isTrusted).toBe(true);
        expect(state.insertRecords.length).toBeGreaterThanOrEqual(1);
    });
});

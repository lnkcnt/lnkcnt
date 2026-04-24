import { beforeEach, describe, expect, test, vi } from "vitest";

const argonState = vi.hoisted(() => ({
    hash: vi.fn(),
    verify: vi.fn(),
}));

vi.mock("@node-rs/argon2", () => ({
    hash: argonState.hash,
    verify: argonState.verify,
}));

import { hashPassword, verifyPassword } from "../lib/password";

describe("password helpers", () => {
    beforeEach(() => {
        argonState.hash.mockReset();
        argonState.verify.mockReset();
    });

    test("hashPassword forwards the password and Argon2 options", async () => {
        argonState.hash.mockResolvedValueOnce("hashed-value");

        const result = await hashPassword("secret-password");

        expect(result).toBe("hashed-value");
        expect(argonState.hash).toHaveBeenCalledWith(
            "secret-password",
            expect.objectContaining({
                memoryCost: 65536,
                timeCost: 3,
                parallelism: 4,
                outputLen: 32,
                algorithm: 2,
            }),
        );
    });

    test("verifyPassword forwards the hash and password to Argon2", async () => {
        argonState.verify.mockResolvedValueOnce(true);

        const result = await verifyPassword({
            password: "secret-password",
            hash: "argon2-hash",
        });

        expect(result).toBe(true);
        expect(argonState.verify).toHaveBeenCalledWith(
            "argon2-hash",
            "secret-password",
            expect.objectContaining({
                memoryCost: 65536,
                timeCost: 3,
                parallelism: 4,
                outputLen: 32,
                algorithm: 2,
            }),
        );
    });

    test("hashes then verifies a real password", async () => {
        const realArgon =
            await vi.importActual<typeof import("@node-rs/argon2")>(
                "@node-rs/argon2",
            );

        argonState.hash.mockImplementation((password, options) =>
            realArgon.hash(password, options),
        );
        argonState.verify.mockImplementation((hash, password, options) =>
            realArgon.verify(hash, password, options),
        );

        const plainPassword = "secret-password";
        const hashedPassword = await hashPassword(plainPassword);

        expect(hashedPassword).toBeTypeOf("string");
        expect(hashedPassword).not.toBe(plainPassword);

        const valid = await verifyPassword({
            password: plainPassword,
            hash: hashedPassword,
        });
        const invalid = await verifyPassword({
            password: "wrong-password",
            hash: hashedPassword,
        });

        expect(valid).toBe(true);
        expect(invalid).toBe(false);
    });
});

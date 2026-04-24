import { describe, expect, test } from "vitest";
import { cn } from "../src/lib/utils";

describe("cn", () => {
    test("merges tailwind classes and keeps the last conflicting class", () => {
        expect(cn("px-2", "px-4", "rounded-md")).toBe("px-4 rounded-md");
    });

    test("drops falsy values", () => {
        expect(cn("text-sm", null, undefined, false, "font-medium")).toBe(
            "text-sm font-medium",
        );
    });
});
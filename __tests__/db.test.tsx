import { prisma } from "../lib/prisma";
import { test, expect } from "vitest";

test("Is DB connected", async () => {
  expect(await prisma.tester.findFirst()).toStrictEqual({ flag: true });
});

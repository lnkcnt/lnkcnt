import { prisma } from "../lib/prisma";
import { expect, test } from "vitest";

test("Is DB connected", async () => {
    expect(await prisma.$queryRaw`SELECT 1`).toEqual([{ 1: 1 }]);
});

test("Can write data on DB", async () => {
    await prisma.tester.create({
        data: {
            flag: true,
        },
    });
    const data = await prisma.tester.findMany({
        where: {
            flag: true,
        },
    });
    expect(data.length).toBeGreaterThanOrEqual(1);

    if (data.length >= 1) {
        await prisma.tester.deleteMany({});
    }
});

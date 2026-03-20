import { prisma } from "../lib/prisma";
import { expect, test } from "vitest";

test("Is DB connected", async () => {
    expect(
        await prisma.tester.findFirst({
            select: {
                flag: true,
            },
        }),
    ).toEqual({ flag: true });
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
    expect(data.length).toBeGreaterThanOrEqual(2);

    if (data.length >= 2) {
        await prisma.tester.deleteMany({});
        await prisma.tester.create({
            data: {
                flag: true,
            },
        });
    }
});

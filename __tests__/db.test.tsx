import { prisma } from "../lib/prisma";
import { test, expect } from "bun:test";

test("Is DB connected", async () => {
  expect(await prisma.tester.findFirst()).toStrictEqual({ flag: true });
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

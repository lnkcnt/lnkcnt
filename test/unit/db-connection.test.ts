import { db } from "@/src/db/index";
import { tester } from "@/src/db/schema";
import { eq, sql } from "drizzle-orm";
import { expect, test } from "vitest";

test("Is DB connected", async () => {
    expect(await db.execute(sql`SELECT 1`)).toBeDefined();
});

test("Can write data on DB", async () => {
    await db.insert(tester).values({ flag: true });
    const data = await db.select().from(tester).where(eq(tester.flag, true));

    expect(data.length).toBeGreaterThanOrEqual(1);

    if (data.length >= 1) {
        await db.delete(tester);
    }
});

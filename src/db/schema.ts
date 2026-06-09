import { sql } from "drizzle-orm";
import { integer } from "drizzle-orm/pg-core";
import { pgTable } from "drizzle-orm/pg-core";

export const linkClickCount = pgTable(
    "linkClickCount",
    {
        clickId: integer().primaryKey({ autoIncrement: true }),
        id: text({ length: 32 })
            .notNull()
            .references(() => links.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        date: text().notNull(),
    },
    (table) => [index("linkClickCount_id_index").on(table.id)],
);

export const links = pgTable("links", {
    id: text({ length: 32 }).primaryKey(),
    redirectUrl: text("redirect_url", { length: 128 }).notNull(),
});

export const tester = pgTable("tester", {
    num: int().primaryKey({ autoIncrement: true }),
    flag: int().default(1).notNull(),
});

export const trustedURL = pgTable("trustedURL", {
    id: int().primaryKey({ autoIncrement: true }),
    url: text({ length: 64 }).notNull(),
});

export const urlBlacklist = pgTable(
    "urlBlacklist",
    {
        blacklistId: int().primaryKey({ autoIncrement: true }),
        pattern: text({ length: 255 }).notNull(),
        note: text({ length: 255 }),
        createdAt: text()
            .default(sql`(CURRENT_TIMESTAMP)`)
            .notNull(),
    },
    (table) => [unique("urlBlacklist_pattern_uk").on(table.pattern)],
);

export const urlManagePage = pgTable(
    "urlManagePage",
    {
        managePage: text({ length: 32 }).primaryKey(),
        id: text({ length: 32 })
            .notNull()
            .references(() => links.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
    },
    (table) => [index("urlManagePage_id_index").on(table.id)],
);

export const urlReport = pgTable(
    "urlReport",
    {
        reportId: int().primaryKey({ autoIncrement: true }),
        id: text({ length: 32 })
            .notNull()
            .references(() => links.id),
        reason: text({ length: 50 }).notNull(),
        message: text().notNull(),
        createdAt: text()
            .default(sql`(CURRENT_TIMESTAMP)`)
            .notNull(),
    },
    (table) => [index("urlReport_id_index").on(table.id)],
);

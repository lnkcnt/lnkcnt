import {
    pgTable,
    serial,
    varchar,
    timestamp,
    index,
    boolean,
    unique,
    text,
} from "drizzle-orm/pg-core";

export const linkClickCount = pgTable(
    "linkClickCount",
    {
        clickId: serial().primaryKey(),
        id: varchar({ length: 32 })
            .notNull()
            .references(() => links.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        date: timestamp().defaultNow().notNull(),
    },
    (table) => [index("linkClickCount_id_index").on(table.id)],
);

export const links = pgTable("links", {
    id: varchar({ length: 32 }).primaryKey(),
    redirectUrl: varchar("redirect_url", { length: 128 }).notNull(),
});

export const tester = pgTable("tester", {
    num: serial().primaryKey(),
    flag: boolean().default(true).notNull(),
});

export const trustedURL = pgTable("trustedURL", {
    id: serial().primaryKey(),
    url: varchar({ length: 64 }).notNull(),
});

export const urlBlacklist = pgTable(
    "urlBlacklist",
    {
        blacklistId: serial().primaryKey(),
        pattern: varchar({ length: 255 }).notNull(),
        note: varchar({ length: 255 }),
        createdAt: timestamp().defaultNow().notNull(),
    },
    (table) => [unique("urlBlacklist_pattern_uk").on(table.pattern)],
);

export const urlManagePage = pgTable(
    "urlManagePage",
    {
        managePage: varchar({ length: 32 }).primaryKey(),
        id: varchar({ length: 32 })
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
        reportId: serial().primaryKey(),
        id: varchar({ length: 32 })
            .notNull()
            .references(() => links.id),
        reason: varchar({ length: 50 }).notNull(),
        message: text().notNull(),
        createdAt: timestamp().defaultNow().notNull(),
    },
    (table) => [index("urlReport_id_index").on(table.id)],
);

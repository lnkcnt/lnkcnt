import {
    pgTable,
    serial,
    boolean,
    varchar,
    unique,
    timestamp,
    index,
    text,
    foreignKey,
} from "drizzle-orm/pg-core";

export const tester = pgTable("tester", {
    num: serial().primaryKey().notNull(),
    flag: boolean().default(true).notNull(),
});

export const trustedUrl = pgTable("trustedURL", {
    id: serial().primaryKey().notNull(),
    url: varchar({ length: 64 }).notNull(),
});

export const urlBlacklist = pgTable(
    "urlBlacklist",
    {
        blacklistId: serial().primaryKey().notNull(),
        pattern: varchar({ length: 255 }).notNull(),
        note: varchar({ length: 255 }),
        createdAt: timestamp({ mode: "date" }).defaultNow().notNull(),
    },
    (table) => [unique("urlBlacklist_pattern_uk").on(table.pattern)],
);

export const links = pgTable("links", {
    id: varchar({ length: 32 }).primaryKey().notNull(),
    redirectUrl: varchar("redirect_url", { length: 128 }).notNull(),
});

export const linkClickCount = pgTable(
    "linkClickCount",
    {
        clickId: serial().primaryKey().notNull(),
        id: varchar({ length: 32 }).notNull(),
        date: timestamp({ mode: "date" }).defaultNow().notNull(),
    },
    (table) => [
        index().using("btree", table.id.asc().nullsLast().op("text_ops")),
        foreignKey({
            columns: [table.id],
            foreignColumns: [links.id],
            name: "linkClickCount_id_links_id_fk",
        })
            .onUpdate("cascade")
            .onDelete("cascade"),
    ],
);

export const urlManagePage = pgTable(
    "urlManagePage",
    {
        managePage: varchar({ length: 32 }).primaryKey().notNull(),
        id: varchar({ length: 32 }).notNull(),
    },
    (table) => [
        index().using("btree", table.id.asc().nullsLast().op("text_ops")),
        foreignKey({
            columns: [table.id],
            foreignColumns: [links.id],
            name: "urlManagePage_id_links_id_fk",
        })
            .onUpdate("cascade")
            .onDelete("cascade"),
    ],
);

export const urlReport = pgTable(
    "urlReport",
    {
        reportId: serial().primaryKey().notNull(),
        id: varchar({ length: 32 }).notNull(),
        reason: varchar({ length: 50 }).notNull(),
        message: text().notNull(),
        createdAt: timestamp({ mode: "date" }).defaultNow().notNull(),
    },
    (table) => [
        index().using("btree", table.id.asc().nullsLast().op("text_ops")),
        foreignKey({
            columns: [table.id],
            foreignColumns: [links.id],
            name: "urlReport_id_links_id_fk",
        })
            .onUpdate("cascade")
            .onDelete("set null"),
    ],
);

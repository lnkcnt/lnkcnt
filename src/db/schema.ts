import { sql } from "drizzle-orm";
import {
    mysqlTable,
    index,
    varchar,
    datetime,
    int,
    unique,
    longtext,
    tinyint,
} from "drizzle-orm/mysql-core";

export const linkClickCount = mysqlTable(
    "linkClickCount",
    {
        clickId: int().autoincrement().primaryKey(),
        id: varchar({ length: 32 })
            .notNull()
            .references(() => links.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            }),
        date: datetime({ mode: "date" }).notNull(),
    },
    (table) => [index("id").on(table.id)],
);

export const links = mysqlTable("links", {
    id: varchar({ length: 32 }).primaryKey(),
    redirectUrl: varchar("redirect_url", { length: 128 }).notNull(),
});

export const tester = mysqlTable("tester", {
    num: int().autoincrement().primaryKey(),
    flag: tinyint().default(1).notNull(),
});

export const trustedURL = mysqlTable("trustedURL", {
    id: int().autoincrement().primaryKey(),
    url: varchar({ length: 64 }).notNull(),
});

export const urlBlacklist = mysqlTable(
    "urlBlacklist",
    {
        blacklistId: int().autoincrement().primaryKey(),
        pattern: varchar({ length: 255 }).notNull(),
        note: varchar({ length: 255 }).default(sql`NULL`),
        createdAt: datetime({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP()`)
            .notNull(),
    },
    (table) => [unique("uniq_pattern").on(table.pattern)],
);

export const urlManagePage = mysqlTable(
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
    (table) => [index("id").on(table.id)],
);

export const urlReport = mysqlTable(
    "urlReport",
    {
        reportId: int().autoincrement().primaryKey(),
        id: varchar({ length: 32 })
            .notNull()
            .references(() => links.id),
        reason: varchar({ length: 50 }).notNull(),
        message: longtext().notNull(),
        createdAt: datetime({ mode: "date" })
            .default(sql`CURRENT_TIMESTAMP()`)
            .notNull(),
    },
    (table) => [index("id").on(table.id)],
);

import { relations } from "drizzle-orm";
import {
    mysqlTable,
    mysqlSchema,
    AnyMySqlColumn,
    index,
    foreignKey,
    varchar,
    text,
    datetime,
    int,
    unique,
    longtext,
    tinyint,
    timestamp,
    boolean,
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
    id: varchar({ length: 32 }).notNull().primaryKey(),
    redirectUrl: varchar("redirect_url", { length: 128 }).notNull(),
});

export const tester = mysqlTable("tester", {
    num: int().autoincrement().notNull().primaryKey(),
    flag: tinyint().default(1).notNull(),
});

export const urlBlacklist = mysqlTable(
    "urlBlacklist",
    {
        blacklistId: int().autoincrement().notNull().primaryKey(),
        pattern: varchar({ length: 255 }).notNull(),
        note: varchar({ length: 255 }).default("NULL"),
        createdAt: datetime({ mode: "date" }).default(new Date()).notNull(),
    },
    (table) => [unique("uniq_pattern").on(table.pattern)],
);

export const urlManagePage = mysqlTable(
    "urlManagePage",
    {
        id: varchar({ length: 32 })
            .notNull()
            .references(() => links.id, {
                onDelete: "cascade",
                onUpdate: "cascade",
            })
            .primaryKey(),
        managePage: varchar({ length: 32 }).notNull(),
    },
    (table) => [index("id").on(table.id)],
);

export const urlReport = mysqlTable(
    "urlReport",
    {
        reportId: int().autoincrement().notNull().primaryKey(),
        id: varchar({ length: 32 })
            .notNull()
            .references(() => links.id),
        reason: varchar({ length: 50 }).notNull(),
        message: longtext().notNull(),
        createdAt: datetime({ mode: "date" }).default(new Date()).notNull(),
    },
    (table) => [index("id").on(table.id)],
);

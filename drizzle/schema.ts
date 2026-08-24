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
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    },
    (table) => [unique("urlBlacklist_pattern_uk").on(table.pattern)],
);

export const verification = pgTable(
    "verification",
    {
        id: text().primaryKey().notNull(),
        identifier: text().notNull(),
        value: text().notNull(),
        expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
        createdAt: timestamp("created_at", { mode: "string" })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { mode: "string" })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("verification_identifier_idx").using(
            "btree",
            table.identifier.asc().nullsLast().op("text_ops"),
        ),
    ],
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
        date: timestamp({ mode: "string" }).defaultNow().notNull(),
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
        createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    },
    (table) => [
        index().using("btree", table.id.asc().nullsLast().op("text_ops")),
        foreignKey({
            columns: [table.id],
            foreignColumns: [links.id],
            name: "urlReport_id_links_id_fk",
        }),
    ],
);

export const user = pgTable(
    "user",
    {
        id: text().primaryKey().notNull(),
        name: text().notNull(),
        email: text().notNull(),
        emailVerified: boolean("email_verified").default(false).notNull(),
        image: text(),
        createdAt: timestamp("created_at", { mode: "string" })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { mode: "string" })
            .defaultNow()
            .notNull(),
    },
    (table) => [unique("user_email_unique").on(table.email)],
);

export const session = pgTable(
    "session",
    {
        id: text().primaryKey().notNull(),
        expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
        token: text().notNull(),
        createdAt: timestamp("created_at", { mode: "string" })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
        ipAddress: text("ip_address"),
        userAgent: text("user_agent"),
        userId: text("user_id").notNull(),
    },
    (table) => [
        index("session_userId_idx").using(
            "btree",
            table.userId.asc().nullsLast().op("text_ops"),
        ),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "session_user_id_user_id_fk",
        }).onDelete("cascade"),
        unique("session_token_unique").on(table.token),
    ],
);

export const account = pgTable(
    "account",
    {
        id: text().primaryKey().notNull(),
        accountId: text("account_id").notNull(),
        providerId: text("provider_id").notNull(),
        userId: text("user_id").notNull(),
        accessToken: text("access_token"),
        refreshToken: text("refresh_token"),
        idToken: text("id_token"),
        accessTokenExpiresAt: timestamp("access_token_expires_at", {
            mode: "string",
        }),
        refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
            mode: "string",
        }),
        scope: text(),
        password: text(),
        createdAt: timestamp("created_at", { mode: "string" })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { mode: "string" }).notNull(),
        issuer: text().notNull(),
    },
    (table) => [
        uniqueIndex("account_issuer_accountId_uidx").using(
            "btree",
            table.issuer.asc().nullsLast().op("text_ops"),
            table.accountId.asc().nullsLast().op("text_ops"),
        ),
        index("account_userId_idx").using(
            "btree",
            table.userId.asc().nullsLast().op("text_ops"),
        ),
        foreignKey({
            columns: [table.userId],
            foreignColumns: [user.id],
            name: "account_user_id_user_id_fk",
        }).onDelete("cascade"),
    ],
);

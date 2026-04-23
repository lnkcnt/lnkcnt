import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, foreignKey, varchar, text, datetime, int, unique, longtext } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const account = mysqlTable("account", {
	id: varchar({ length: 191 }).notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: varchar({ length: 191 }).notNull().references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	accessToken: text().default('NULL'),
	refreshToken: text().default('NULL'),
	idToken: text().default('NULL'),
	accessTokenExpiresAt: datetime({ mode: 'string', fsp: 3 }).default('NULL'),
	refreshTokenExpiresAt: datetime({ mode: 'string', fsp: 3 }).default('NULL'),
	scope: text().default('NULL'),
	password: text().default('NULL'),
	createdAt: datetime({ mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime({ mode: 'string', fsp: 3 }).notNull(),
},
(table) => [
	index("account_userId_idx").on(table.userId),
]);

export const linkClickCount = mysqlTable("linkClickCount", {
	clickId: int().autoincrement().notNull(),
	id: varchar({ length: 32 }).notNull().references(() => links.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	date: datetime({ mode: 'string'}).notNull(),
},
(table) => [
	index("id").on(table.id),
]);

export const links = mysqlTable("links", {
	id: varchar({ length: 32 }).notNull(),
	redirectUrl: varchar("redirect_url", { length: 128 }).notNull(),
});

export const session = mysqlTable("session", {
	id: varchar({ length: 191 }).notNull(),
	expiresAt: datetime({ mode: 'string', fsp: 3 }).notNull(),
	token: varchar({ length: 191 }).notNull(),
	createdAt: datetime({ mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime({ mode: 'string', fsp: 3 }).notNull(),
	ipAddress: text().default('NULL'),
	userAgent: text().default('NULL'),
	userId: varchar({ length: 191 }).notNull().references(() => user.id, { onDelete: "cascade", onUpdate: "cascade" } ),
},
(table) => [
	index("session_userId_idx").on(table.userId),
	unique("session_token_key").on(table.token),
]);

export const tester = mysqlTable("tester", {
	num: int().autoincrement().notNull(),
	flag: tinyint().default(1).notNull(),
});

export const urlBlacklist = mysqlTable("urlBlacklist", {
	blacklistId: int().autoincrement().notNull(),
	pattern: varchar({ length: 255 }).notNull(),
	note: varchar({ length: 255 }).default('NULL'),
	createdAt: datetime({ mode: 'string'}).default('current_timestamp()').notNull(),
},
(table) => [
	unique("uniq_pattern").on(table.pattern),
]);

export const urlManagePage = mysqlTable("urlManagePage", {
	id: varchar({ length: 32 }).notNull().references(() => links.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	managePage: varchar({ length: 32 }).notNull(),
},
(table) => [
	index("id").on(table.id),
]);

export const urlReport = mysqlTable("urlReport", {
	reportId: int().autoincrement().notNull(),
	id: varchar({ length: 32 }).notNull().references(() => links.id),
	reason: varchar({ length: 50 }).notNull(),
	message: longtext().notNull(),
	createdAt: datetime({ mode: 'string'}).default('current_timestamp()').notNull(),
},
(table) => [
	index("id").on(table.id),
]);

export const user = mysqlTable("user", {
	id: varchar({ length: 191 }).notNull(),
	name: text().notNull(),
	email: varchar({ length: 191 }).notNull(),
	emailVerified: tinyint().default(0).notNull(),
	image: text().default('NULL'),
	createdAt: datetime({ mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime({ mode: 'string', fsp: 3 }).notNull(),
},
(table) => [
	unique("user_email_key").on(table.email),
]);

export const verification = mysqlTable("verification", {
	id: varchar({ length: 191 }).notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: datetime({ mode: 'string', fsp: 3 }).notNull(),
	createdAt: datetime({ mode: 'string', fsp: 3 }).default('current_timestamp(3)').notNull(),
	updatedAt: datetime({ mode: 'string', fsp: 3 }).notNull(),
},
(table) => [
	index("verification_identifier_idx").on(table.identifier),
]);

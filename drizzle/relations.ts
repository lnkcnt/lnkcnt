import { relations } from "drizzle-orm/relations";
import {
    links,
    linkClickCount,
    urlManagePage,
    urlReport,
    user,
    session,
    account,
} from "./schema";

export const linkClickCountRelations = relations(linkClickCount, ({ one }) => ({
    link: one(links, {
        fields: [linkClickCount.id],
        references: [links.id],
    }),
}));

export const linksRelations = relations(links, ({ many }) => ({
    linkClickCounts: many(linkClickCount),
    urlManagePages: many(urlManagePage),
    urlReports: many(urlReport),
}));

export const urlManagePageRelations = relations(urlManagePage, ({ one }) => ({
    link: one(links, {
        fields: [urlManagePage.id],
        references: [links.id],
    }),
}));

export const urlReportRelations = relations(urlReport, ({ one }) => ({
    link: one(links, {
        fields: [urlReport.id],
        references: [links.id],
    }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, {
        fields: [session.userId],
        references: [user.id],
    }),
}));

export const userRelations = relations(user, ({ many }) => ({
    sessions: many(session),
    accounts: many(account),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, {
        fields: [account.userId],
        references: [user.id],
    }),
}));

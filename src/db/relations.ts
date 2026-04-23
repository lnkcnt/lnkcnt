import { relations } from "drizzle-orm/relations";
import { links, linkClickCount, urlManagePage, urlReport } from "./schema";

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

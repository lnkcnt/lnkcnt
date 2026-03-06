import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Report a URL",
};

export default function ReportLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "URL Management",
};

export default function ManageLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

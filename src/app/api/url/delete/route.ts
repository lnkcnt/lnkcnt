"use server";

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            {
                message: "Invalid JSON body",
            },
            { status: 400 },
        );
    }

    try {
        const managePage = await prisma.urlManagePage.findFirst({
            where: { managePage: body.id },
        });

        if (!managePage) {
            return NextResponse.json(
                {
                    message: "ID not found",
                },
                { status: 404 },
            );
        }

        // 링크 삭제
        await prisma.links.delete({
            where: { id: managePage.id },
        });
        return NextResponse.json({
            success: true,
            message: "Successfully deleted",
        });
    } catch (error) {
        return NextResponse.json(
            { message: `Internal error: ${error}` },
            { status: 500 },
        );
    }
}

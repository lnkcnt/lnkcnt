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
                errors: { errors: ["Invalid request body"], properties: {} },
            },
            { status: 400 },
        );
    }

    const success: boolean = await DeleteURL(body.id);
    if (success) {
        return NextResponse.json({
            success: true,
            message: "Successfully deleted",
        });
    } else {
        return NextResponse.json(
            {
                error: "Internal error",
            },
            { status: 500 },
        );
    }
}

/**
 * Delete a URL based on Management Page ID.
 * @param id Management Page ID
 * @returns true when success, false when failed.
 */
export async function DeleteURL(id: string): Promise<boolean> {
    try {
        // 관리 페이지에서 실제 링크 id 찾기
        const managePage = await prisma.urlManagePage.findFirst({
            where: { managePage: id },
        });

        if (!managePage) {
            return false;
        }

        // 링크 삭제
        await prisma.links.delete({
            where: { id: managePage.id },
        });

        return true;
    } catch (error) {
        console.error("Error deleting link:", error);
        return false;
    }
}

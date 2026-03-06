"use server";

import { prisma } from "@/lib/prisma";

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

import { prisma } from "../../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * DELETE handler for removing a link and its click records by management page ID
 * @param request - NextRequest object
 * @param context - Route context containing params (Promise<{ id: string }>)
 * @returns JSON response with result or error
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    // 관리 페이지에서 실제 링크 id 찾기
    const managePage = await prisma.urlManagePage.findFirst({
      where: { managePage: id },
    });

    if (!managePage) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // 클릭 기록 먼저 삭제
    await prisma.linkClickCount.deleteMany({
      where: { id: managePage.id },
    });

    // 링크 삭제
    await prisma.links.delete({
      where: { id: managePage.id },
    });

    // 관리 페이지 엔트리 삭제
    await prisma.urlManagePage.delete({
      where: { id: managePage.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET handler for fetching link data by management page ID
 * @param request - NextRequest object
 * @param params - Route parameters containing the management page ID
 * @returns JSON response with link data or error
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    // Find the management page entry by managePage field
    const managePage = await prisma.urlManagePage.findFirst({
      where: {
        managePage: id,
      },
    });

    if (!managePage) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Fetch the corresponding link data with click counts
    const linkData = await prisma.links.findUnique({
      where: {
        id: managePage.id,
      },
    });

    if (!linkData) {
      return NextResponse.json(
        { error: "Link data not found" },
        { status: 404 },
      );
    }

    // 집계 쿼리로 클릭 수 가져오기
    const clickCount = await prisma.linkClickCount.count({
      where: { id: managePage.id },
    });

    // 클릭 상세 정보도 필요하면 따로 조회
    const clicks = await prisma.linkClickCount.findMany({
      where: { id: managePage.id },
      select: { ip: true, date: true },
    });

    return NextResponse.json({
      id: linkData.id,
      redirect_url: linkData.redirect_url,
      click_count: clickCount,
      clicks,
    });
  } catch (error) {
    console.error("Error fetching link:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

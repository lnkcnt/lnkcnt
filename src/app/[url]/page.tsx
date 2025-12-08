import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../generated/prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Check if URL is in blacklist
 * @param url - URL to check against blacklist
 * @returns true if URL is blacklisted, false otherwise
 */
function isBlacklisted(url: string): boolean {
  try {
    const blacklistPath = join(process.cwd(), "url-blacklist.txt");
    const blacklistContent = readFileSync(blacklistPath, "utf-8");
    const blacklistedItems = blacklistContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));

    const urlObj = new URL(url);
    const domain = urlObj.hostname;

    return blacklistedItems.some((item) => {
      // 정확한 도메인 매칭 또는 URL 패턴 매칭
      return domain.includes(item) || url.includes(item);
    });
  } catch {
    // 블랙리스트 파일이 없으면 체크하지 않음
    return false;
  }
}

/**
 * Get client IP address from headers
 * @param headersList - Next.js headers object
 * @returns Client IP address
 */
function getClientIP(headersList: Awaited<ReturnType<typeof headers>>): string {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  const realIP = headersList.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  return "unknown";
}

export default async function Redirection({
  params,
}: {
  params: Promise<{ url: string }>;
}) {
  const { url } = await params;
  let finalURL: string;
  try {
    const query = await prisma.links.findUnique({
      where: {
        id: url,
      },
      select: {
        redirect_url: true,
      },
    });

    finalURL = query?.redirect_url!;

    // 블랙리스트 체크
    if (finalURL && isBlacklisted(finalURL)) {
      notFound();
    }

    // Log the click if link exists
    if (finalURL) {
      const headersList = await headers();
      const clientIP = getClientIP(headersList);

      try {
        await prisma.linkClickCount.create({
          data: {
            id: url,
            ip: clientIP,
            date: new Date(),
          },
        });
      } catch (err) {
        // Log error but don't block redirect
        console.error("Failed to log click:", err);
      }
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error();
    }
  }
  if (finalURL!) {
    redirect(finalURL);
  } else {
    notFound();
  }
}

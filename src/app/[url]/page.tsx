import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../generated/prisma/client";

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

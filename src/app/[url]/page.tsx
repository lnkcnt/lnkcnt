import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "../../../generated/prisma/client";

// TODO: Implement database counter increasement
export default async function Redirection({
  params,
}: {
  params: Promise<{ url: string }>;
}) {
  const { url } = await params;
  try {
    const finalUrl = await prisma.links.findUnique({
      where: {
        id: url,
      },
      select: {
        redirect_url: true,
      },
    });
    if (finalUrl?.redirect_url) {
      redirect(finalUrl.redirect_url!);
    } else {
      notFound();
    }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      throw new Error();
    } else {
      notFound();
    }
  }
}

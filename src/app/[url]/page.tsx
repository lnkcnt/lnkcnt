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

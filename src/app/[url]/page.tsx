import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

// TODO: Implement Database-based redirection
// TODO 2: Implement database counter increasement
export default async function Redirection({
  params,
}: {
  params: Promise<{ url: string }>;
}) {
  const { url } = await params;
  const finalUrl = await prisma.links.findUnique({
    where: {
      id: url,
    },
    select: {
      redirect_url: true,
    },
  });

  if (finalUrl?.redirect_url! != null) {
    redirect(finalUrl?.redirect_url!);
  } else {
    notFound();
  }
}

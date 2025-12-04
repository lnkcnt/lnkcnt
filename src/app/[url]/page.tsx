import { redirect } from "next/navigation";

// TODO: Implement Database-based redirection
// TODO 2: Implement database counter increasement
export default async function Redirection({
  params,
}: {
  params: Promise<{ url: string }>;
}) {
  const { url } = await params;

  redirect("https://" + url);
}

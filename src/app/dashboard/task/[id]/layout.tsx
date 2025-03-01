import { getUserServer } from "@/lib/serverApi";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function TaskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserServer();
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!user.success) {
    redirect("/login");
  }
  if (!token) {
    redirect("/login");
  }

  return <>{children}</>;
}

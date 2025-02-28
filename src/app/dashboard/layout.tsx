import { getUserServer } from "@/lib/serverApi";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserServer();
  console.log(user);

  if (!user.success) {
    redirect("/login");
  }

  return <>{children}</>;
}

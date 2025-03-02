import { getUserServer } from "@/lib/serverApi";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");
  console.log("login");
  console.log(token);
  if (token) {
    redirect("/dashboard");
  }
  const user = await getUserServer();
  console.log(user);

  return <>{children}</>;
}

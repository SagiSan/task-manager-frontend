import Dashboard from "./components/Dashboard";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");
  if (!token) {
    redirect("/login");
  }
  return <Dashboard />;
}

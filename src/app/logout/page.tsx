import { logoutUser } from "@/lib/api";
import { redirect } from "next/navigation";

export default async function LogoutPage() {
  await logoutUser();
  redirect("/login");
}

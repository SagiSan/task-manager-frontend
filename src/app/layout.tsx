import "./globals.css";
import { getUserServer } from "@/lib/serverApi";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "Task Manager",
  description: "Task Manager Application",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUserServer();
  const isAuthPage =
    typeof window !== "undefined" &&
    (window.location.pathname === "/login" ||
      window.location.pathname === "/register");

  return (
    <html lang="en">
      <body className="bg-slate-500">
        {!isAuthPage && user && <Navbar />}
        <main className="container mx-auto">{children}</main>
      </body>
    </html>
  );
}

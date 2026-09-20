import { redirect } from "next/navigation";
import { getSessionUser } from "@/server/session";
import { AdminShell } from "@/components/admin/AdminShell";

/**
 * Protected admin layout. Server-verifies the session (middleware also guards
 * these routes, this is defense-in-depth) and wraps pages in the admin chrome.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getSessionUser();
  if (!user) redirect("/admin/login");
  return <AdminShell username={user}>{children}</AdminShell>;
}

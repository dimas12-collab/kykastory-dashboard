import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { sqlite } from "../db";

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  const row = sqlite.prepare("SELECT role FROM user WHERE id = ?").get(session.user.id) as { role?: string } | undefined;
  if (row?.role !== "ADMIN" && row?.role !== "SUPER_ADMIN") redirect("/dashboard");
  return { session, role: row.role };
}

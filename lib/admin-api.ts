import { headers } from "next/headers";
import { auth } from "./auth";
import { sqlite } from "../db";

export async function getAdminApiSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const row = sqlite.prepare("SELECT role FROM user WHERE id = ?").get(session.user.id) as { role?: string } | undefined;
  if (row?.role !== "ADMIN" && row?.role !== "SUPER_ADMIN") return null;
  return session;
}

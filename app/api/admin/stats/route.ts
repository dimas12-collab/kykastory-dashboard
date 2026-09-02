import { NextResponse } from "next/server";
import { getAdminApiSession } from "../../../../lib/admin-api";
import { sqlite } from "../../../../db";

export async function GET() {
  if (!await getAdminApiSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clients = (sqlite.prepare("SELECT COUNT(*) as count FROM user WHERE role = 'CLIENT'").get() as { count: number }).count;
  const invitations = (sqlite.prepare("SELECT COUNT(*) as count FROM projects WHERE status = 'ACTIVE'").get() as { count: number }).count;
  const rsvp = (sqlite.prepare("SELECT COUNT(*) as count FROM rsvps").get() as { count: number }).count;
  const projects = sqlite.prepare("SELECT id, name, couple_name as coupleName, status, updated_at as updatedAt FROM projects ORDER BY updated_at DESC LIMIT 8").all();
  return NextResponse.json({ data: { clients, invitations, rsvp, views: 0, projects } });
}

import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { auth } from "../../../lib/auth";
import { db, sqlite } from "../../../db";
import { projectMembers, projects } from "../../../db/schema";
import { bootstrap } from "../../../lib/server";

export async function GET(request: NextRequest) {
  bootstrap();
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const role = (sqlite.prepare("SELECT role FROM user WHERE id = ?").get(session.user.id) as { role?: string } | undefined)?.role;
  const all = db.select().from(projects).orderBy(desc(projects.createdAt)).all();
  const data = role === "ADMIN" || role === "SUPER_ADMIN" ? all : all.filter(item => item.ownerId === session.user.id || db.select().from(projectMembers).where(eq(projectMembers.projectId, item.id)).all().some(member => member.userId === session.user.id));
  return NextResponse.json({ data });
}

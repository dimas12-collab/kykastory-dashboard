import { NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { db, sqlite } from "../db";
import { projectMembers, projects } from "../db/schema";

export async function getProjectAccess(request: NextRequest, projectId: string) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { session: null, project: null, role: null };
  const user = sqlite.prepare("SELECT role FROM user WHERE id = ?").get(session.user.id) as { role?: string } | undefined;
  const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!project) return { session, project: null, role: user?.role || null };
  const admin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
  const member = project.ownerId === session.user.id || Boolean(db.select().from(projectMembers).where(eq(projectMembers.projectId, projectId)).all().some(row => row.userId === session.user.id));
  return { session, project: admin || member ? project : null, role: user?.role || null };
}

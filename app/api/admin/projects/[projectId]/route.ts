import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, sqlite } from "../../../../../db";
import { projectMembers, projects } from "../../../../../db/schema";
import { getAdminApiSession } from "../../../../../lib/admin-api";
import { bootstrap } from "../../../../../lib/server";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  if (!await getAdminApiSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  bootstrap(); const { projectId } = await params; const body = await request.json().catch(() => ({}));
  const current = db.select().from(projects).where(eq(projects.id, projectId)).get();
  if (!current) return NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });
  const updated = db.update(projects).set({ ownerId: body.clientId === undefined ? current.ownerId : String(body.clientId || "unassigned"), name: body.name?.trim() || current.name, coupleName: body.coupleName?.trim() || current.coupleName, eventDate: body.eventDate || current.eventDate, invitationUrl: body.invitationUrl?.trim() || current.invitationUrl, coverImageUrl: body.coverImageUrl === undefined ? current.coverImageUrl : body.coverImageUrl || null, wordpressPostId: body.wordpressPostId === undefined ? current.wordpressPostId : body.wordpressPostId ? Number(body.wordpressPostId) : null, wordpressUrl: body.wordpressUrl === undefined ? current.wordpressUrl : body.wordpressUrl || null, weddingpressSyncUrl: body.weddingpressSyncUrl === undefined ? current.weddingpressSyncUrl : body.weddingpressSyncUrl || null, updatedAt: new Date() }).where(eq(projects.id, projectId)).returning().get();
  if (body.clientId !== undefined) { sqlite.prepare("DELETE FROM project_members WHERE project_id = ?").run(projectId); if (body.clientId) db.insert(projectMembers).values({ projectId, userId: String(body.clientId), createdAt: new Date() }).run(); }
  return NextResponse.json({ data: updated });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  if (!await getAdminApiSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  bootstrap(); const { projectId } = await params;
  const deleted = db.delete(projects).where(eq(projects.id, projectId)).returning().get();
  return deleted ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });
}

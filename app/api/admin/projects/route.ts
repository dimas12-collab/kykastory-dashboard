import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db, sqlite } from "../../../../db";
import { projects, projectMembers } from "../../../../db/schema";
import { bootstrap } from "../../../../lib/server";
import { getAdminApiSession } from "../../../../lib/admin-api";

export async function GET() {
  if (!await getAdminApiSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  bootstrap();
  const rows = db.select().from(projects).orderBy(desc(projects.createdAt)).all();
  const data = rows.map(project => ({ ...project, clients: sqlite.prepare("SELECT u.id, u.name, u.email FROM user u INNER JOIN project_members pm ON pm.user_id = u.id WHERE pm.project_id = ?").all(project.id) }));
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  if (!await getAdminApiSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  bootstrap();
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const coupleName = String(body.coupleName || "").trim();
  const slug = String(body.slug || coupleName || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (!name || !coupleName || !slug || !body.eventDate) return NextResponse.json({ error: "Nama project, nama pasangan, slug, dan tanggal wajib diisi." }, { status: 400 });
  const now = new Date();
  try {
    const project = db.insert(projects).values({ id: crypto.randomUUID(), ownerId: String(body.clientId || "unassigned"), name, coupleName, slug, eventDate: String(body.eventDate), invitationUrl: String(body.invitationUrl || `kykastory.com/${slug}`), coverImageUrl: body.coverImageUrl || null, wordpressPostId: body.wordpressPostId ? Number(body.wordpressPostId) : null, wordpressUrl: body.wordpressUrl || null, weddingpressSyncUrl: body.weddingpressSyncUrl || null, status: "ACTIVE", createdAt: now, updatedAt: now }).returning().get();
    if (body.clientId) db.insert(projectMembers).values({ projectId: project.id, userId: String(body.clientId), createdAt: now }).run();
    return NextResponse.json({ data: project }, { status: 201 });
  } catch { return NextResponse.json({ error: "Project gagal dibuat. Slug mungkin sudah digunakan." }, { status: 422 }); }
}

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "../../../../lib/auth";
import { db, sqlite } from "../../../../db";
import { projects } from "../../../../db/schema";
import { bootstrap } from "../../../../lib/server";
import { getProjectAccess } from "../../../../lib/project-access";

async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return false;
  const user = sqlite.prepare("SELECT role FROM user WHERE id = ?").get(session.user.id) as { role?: string } | undefined;
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  bootstrap();
  const { projectId } = await params;
  if (!(await getProjectAccess(request, projectId)).project) return NextResponse.json({ error: "Akses project ditolak" }, { status: 403 });
  const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
  return project ? NextResponse.json({ data: project }) : NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  bootstrap();
  const { projectId } = await params;
  const admin = await requireAdmin(request);
  const access = await getProjectAccess(request, projectId);
  if (!admin && !access.project) return NextResponse.json({ error: "Akses project ditolak" }, { status: 403 });
  const body = await request.json();
  const fields = ["name", "coupleName", "eventDate", "invitationUrl", "coverImageUrl", "wordpressPostId", "wordpressUrl", "weddingpressSyncUrl"] as const;
  const values: Record<string, unknown> = { updatedAt: new Date() };
  for (const field of fields) if (field in body) values[field] = body[field];
  if (typeof values.coverImageUrl === "string" && values.coverImageUrl && !/^https?:\/\//i.test(values.coverImageUrl)) return NextResponse.json({ error: "URL thumbnail harus menggunakan http atau https" }, { status: 400 });
  if ("wordpressPostId" in values && values.wordpressPostId !== null && (!Number.isInteger(Number(values.wordpressPostId)) || Number(values.wordpressPostId) < 1)) return NextResponse.json({ error: "WordPress Post ID tidak valid" }, { status: 400 });
  const updated = db.update(projects).set(values).where(eq(projects.id, projectId)).returning().get();
  return updated ? NextResponse.json({ data: updated }) : NextResponse.json({ error: "Project tidak ditemukan" }, { status: 404 });
}

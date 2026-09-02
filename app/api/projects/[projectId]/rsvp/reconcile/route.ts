import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "../../../../../../db";
import { projects, rsvps, webhookLogs } from "../../../../../../db/schema";
import { bootstrap } from "../../../../../../lib/server";
import { getProjectAccess } from "../../../../../../lib/project-access";

type WeddingPressEntry = { name?: unknown; guestName?: unknown; message?: unknown; status?: unknown; attendanceStatus?: unknown; guestCount?: unknown; submittedAt?: unknown; created_at?: unknown };
function statusOf(entry: WeddingPressEntry) { const status = String(entry.attendanceStatus || entry.status || "").toUpperCase(); return status === "ATTENDING" || status === "HADIR" || status === "AKAN HADIR" ? "ATTENDING" : status === "MAYBE" || status === "RAGU" ? "MAYBE" : "NOT_ATTENDING"; }

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  bootstrap(); const { projectId } = await params;
  if (!(await getProjectAccess(request, projectId)).project) return NextResponse.json({ error: "Akses project ditolak" }, { status: 403 });
  const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
  const secret = process.env.WEDDINGPRESS_WEBHOOK_SECRET;
  if (!project?.wordpressPostId || !secret) return NextResponse.json({ error: "WordPress Post ID atau WEDDINGPRESS_WEBHOOK_SECRET belum dikonfigurasi." }, { status: 400 });
  const endpoint = project.weddingpressSyncUrl || (project.wordpressUrl ? `${project.wordpressUrl.replace(/\/$/, "")}/wp-json/kykastory/v1/rsvp` : "");
  if (!endpoint) return NextResponse.json({ error: "WeddingPress Sync URL atau WordPress URL belum diatur." }, { status: 400 });
  try {
    const url = new URL(endpoint); url.searchParams.set("post_id", String(project.wordpressPostId));
    const response = await fetch(url, { headers: { "x-weddingpress-secret": secret }, cache: "no-store" });
    const remote = await response.json().catch(() => ({}));
    if (!response.ok || !Array.isArray(remote.rsvps)) throw new Error(remote.message || remote.error || "Endpoint WeddingPress tidak mengembalikan data RSVP.");
    const now = new Date();
    const entries = (remote.rsvps as WeddingPressEntry[]).flatMap(entry => { const guestName = String(entry.guestName || entry.name || "").trim(); if (!guestName) return []; const submittedAt = new Date(String(entry.submittedAt || entry.created_at || now.toISOString())); return [{ projectId, guestName, attendanceStatus: statusOf(entry), guestCount: Math.max(0, Number(entry.guestCount || 1) || 1), message: String(entry.message || ""), submittedAt: Number.isNaN(submittedAt.getTime()) ? now : submittedAt }]; });
    db.transaction(tx => { tx.delete(rsvps).where(eq(rsvps.projectId, projectId)).run(); if (entries.length) tx.insert(rsvps).values(entries).run(); });
    db.insert(webhookLogs).values({ projectId, source: "WeddingPress reconcile", status: "SUCCESS", imported: entries.length, message: "Data RSVP disamakan dengan Guestbook WordPress", createdAt: now }).run();
    return NextResponse.json({ ok: true, imported: entries.length, data: db.select().from(rsvps).where(eq(rsvps.projectId, projectId)).all() });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Sinkronisasi WeddingPress gagal.";
    db.insert(webhookLogs).values({ projectId, source: "WeddingPress reconcile", status: "ERROR", imported: 0, message, createdAt: new Date() }).run();
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

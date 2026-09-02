import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../db";
import { rsvps, webhookLogs } from "../../../../../../db/schema";
import { bootstrap } from "../../../../../../lib/server";
import { getProjectAccess } from "../../../../../../lib/project-access";

export async function POST(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  bootstrap(); const { projectId } = await params;
  const access = await getProjectAccess(request, projectId);
  const webhookAuthorized = Boolean(process.env.WEDDINGPRESS_WEBHOOK_SECRET && request.headers.get("x-weddingpress-secret") === process.env.WEDDINGPRESS_WEBHOOK_SECRET);
  if (!access.project && !webhookAuthorized) return NextResponse.json({ error: "Akses project ditolak" }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const entries = Array.isArray(body.rsvps) ? body.rsvps : Array.isArray(body.data) ? body.data : [];
  if (!entries.length) { db.insert(webhookLogs).values({ projectId, source: String(body.source || "WeddingPress"), status: "ERROR", imported: 0, message: "Payload RSVP kosong", createdAt: new Date() }).run(); return NextResponse.json({ error: "Payload RSVP kosong. Gunakan { rsvps: [...] }." }, { status: 400 }); }
  const now = new Date();
  const inserted = entries.flatMap((item: Record<string, unknown>) => {
    const guestName = String(item.guestName || item.name || item.guest_name || "").trim();
    const rawStatus = String(item.attendanceStatus || item.status || item.attendance_status || "").toUpperCase();
    const attendanceStatus = rawStatus === "ATTENDING" || rawStatus === "HADIR" ? "ATTENDING" : rawStatus === "MAYBE" || rawStatus === "RAGU" ? "MAYBE" : "NOT_ATTENDING";
    if (!guestName) return [];
    return [db.insert(rsvps).values({ projectId, guestName, attendanceStatus, guestCount: Number(item.guestCount || item.guest_count || 1), message: String(item.message || ""), submittedAt: now }).returning().get()];
  });
  db.insert(webhookLogs).values({ projectId, source: String(body.source || "WeddingPress"), status: "SUCCESS", imported: inserted.length, message: "Webhook diproses", createdAt: new Date() }).run();
  return NextResponse.json({ ok: true, source: body.source || "WeddingPress", imported: inserted.length, data: inserted });
}

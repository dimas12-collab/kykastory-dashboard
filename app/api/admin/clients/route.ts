import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { getAdminApiSession } from "../../../../lib/admin-api";
import { sqlite } from "../../../../db";

export async function GET() {
  const session = await getAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const clients = sqlite.prepare("SELECT id, name, email, role, createdAt FROM user WHERE role = 'CLIENT' ORDER BY createdAt DESC").all();
  return NextResponse.json({ data: clients });
}

export async function POST(request: NextRequest) {
  const session = await getAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!name || !email || password.length < 8) return NextResponse.json({ error: "Nama, email, dan password minimal 8 karakter wajib diisi." }, { status: 400 });
  try {
    const result = await auth.api.signUpEmail({ body: { name, email, password } });
    sqlite.prepare("UPDATE user SET role = ? WHERE email = ?").run("CLIENT", email);
    return NextResponse.json({ data: { ...result.user, role: "CLIENT" } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Client gagal dibuat. Email mungkin sudah terdaftar." }, { status: 422 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!await getAdminApiSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || ""); const name = String(body.name || "").trim(); const email = String(body.email || "").trim().toLowerCase();
  if (!id || !name || !email) return NextResponse.json({ error: "ID, nama, dan email wajib diisi." }, { status: 400 });
  const existing = sqlite.prepare("SELECT id FROM user WHERE id = ? AND role = 'CLIENT'").get(id);
  if (!existing) return NextResponse.json({ error: "Client tidak ditemukan." }, { status: 404 });
  try { sqlite.prepare("UPDATE user SET name = ?, email = ? WHERE id = ?").run(name, email, id); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Email mungkin sudah digunakan." }, { status: 422 }); }
}

export async function DELETE(request: NextRequest) {
  if (!await getAdminApiSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id"); if (!id) return NextResponse.json({ error: "ID client wajib diisi." }, { status: 400 });
  const linked = sqlite.prepare("SELECT COUNT(*) as count FROM project_members WHERE user_id = ?").get(id) as { count: number };
  if (linked.count > 0) return NextResponse.json({ error: "Client masih memiliki project. Lepas assignment terlebih dahulu." }, { status: 409 });
  const deleted = sqlite.prepare("DELETE FROM user WHERE id = ? AND role = 'CLIENT'").run(id); return deleted.changes ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Client tidak ditemukan." }, { status: 404 });
}

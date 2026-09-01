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

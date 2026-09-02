import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@better-auth/utils/password";
import { sqlite } from "../../../../db";
import { getAdminApiSession } from "../../../../lib/admin-api";

export async function GET() {
  const session = await getAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = sqlite.prepare("SELECT id, name, email, role FROM user WHERE id = ?").get(session.user.id);
  return NextResponse.json({ data: user });
}

export async function PATCH(request: NextRequest) {
  const session = await getAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim(); const email = String(body.email || "").trim().toLowerCase(); const password = String(body.password || "");
  if (!name || !email) return NextResponse.json({ error: "Nama dan email wajib diisi." }, { status: 400 });
  if (password && password.length < 8) return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 });
  try {
    sqlite.prepare("UPDATE user SET name = ?, email = ?, updatedAt = ? WHERE id = ?").run(name, email, Date.now(), session.user.id);
    if (password) sqlite.prepare("UPDATE account SET password = ?, updatedAt = ? WHERE userId = ? AND providerId = 'credential'").run(await hashPassword(password), Date.now(), session.user.id);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Email mungkin sudah digunakan." }, { status: 422 }); }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../lib/auth";
import { sqlite } from "../../../../db";

export async function POST(request: NextRequest) {
  const setupToken = request.headers.get("x-setup-token");
  if (!process.env.SETUP_TOKEN || setupToken !== process.env.SETUP_TOKEN) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (!body.name || !body.email || !body.password) return NextResponse.json({ error: "name, email, dan password wajib diisi" }, { status: 400 });
  try {
    const result = await auth.api.signUpEmail({ body: { name: body.name, email: body.email, password: body.password } });
    sqlite.prepare("UPDATE user SET role = ? WHERE email = ?").run("ADMIN", body.email);
    return NextResponse.json({ ok: true, role: "ADMIN", user: result.user });
  } catch {
    return NextResponse.json({ error: "User gagal dibuat. Email mungkin sudah terdaftar." }, { status: 422 });
  }
}

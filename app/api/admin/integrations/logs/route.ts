import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "../../../../../db";
import { webhookLogs } from "../../../../../db/schema";
import { getAdminApiSession } from "../../../../../lib/admin-api";
import { bootstrap } from "../../../../../lib/server";

export async function GET() {
  if (!await getAdminApiSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  bootstrap();
  return NextResponse.json({ data: db.select().from(webhookLogs).orderBy(desc(webhookLogs.createdAt)).limit(30).all() });
}

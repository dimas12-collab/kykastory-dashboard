import { eq } from "drizzle-orm";
import { db, ensureDatabase, sqlite } from "../db";
import { projects, guests, rsvps, messageTemplates } from "../db/schema";

const now = () => new Date();

export function bootstrap() {
  ensureDatabase();
  // Demo fixtures are opt-in. Production databases must remain empty after a reset.
  if (process.env.SEED_DEMO_DATA !== "true") return;
  const demoUser = sqlite.prepare("SELECT id FROM user WHERE email = 'demo@kykastory.local'").get() as { id?: string } | undefined;
  if (demoUser?.id) {
    sqlite.prepare("UPDATE projects SET owner_id = ? WHERE id = 'demo-project' AND owner_id = 'demo-user'").run(demoUser.id);
    sqlite.prepare("INSERT OR IGNORE INTO project_members (project_id, user_id, created_at) VALUES (?, ?, ?)").run("demo-project", demoUser.id, Date.now());
  }
  const existing = db.select().from(projects).where(eq(projects.id, "demo-project")).get();
  if (existing) return;
  db.insert(projects).values({ id: "demo-project", ownerId: demoUser?.id || "demo-user", name: "Wedding Chika & Fariz", coupleName: "Chika & Fariz", slug: "chika-fariz", eventDate: "2026-10-17", invitationUrl: "kykastory.com/chika-fariz", coverImageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", status: "ACTIVE", createdAt: now(), updatedAt: now() }).run();
  if (demoUser?.id) sqlite.prepare("INSERT OR IGNORE INTO project_members (project_id, user_id, created_at) VALUES (?, ?, ?)").run("demo-project", demoUser.id, Date.now());
  db.insert(messageTemplates).values({ projectId: "demo-project", name: "Undangan pernikahan", content: "Halo {{guest_name}}, kami mengundangmu ke pernikahan {{couple_name}}.\n\nBuka undangan: {{invitation_url}}\n\nTerima kasih.", createdAt: now(), updatedAt: now() }).run();
  const names = ["Aditya & Dewi", "Bima Pratama", "Citra Lestari", "Dimas Saputra", "Elsa & Raka", "Fajar Nugroho", "Gita Anindya", "Hana Putri"];
  db.insert(guests).values(names.map((name, i) => ({ projectId: "demo-project", name, phone: `6281234567${String(i).padStart(2, "0")}`, category: i % 3 === 0 ? "Keluarga" : "Teman", seatCount: i % 2 ? 2 : 1, slug: name.toLowerCase().replaceAll(" ", "-"), deliveryStatus: i < 5 ? "SENT" : "NOT_SENT", createdAt: now(), updatedAt: now() }))).run();
  db.insert(rsvps).values([{ projectId: "demo-project", guestName: "Dimas", attendanceStatus: "ATTENDING", guestCount: 1, message: "Selamat ya, semoga menjadi keluarga yang sakinah!", submittedAt: now() }, { projectId: "demo-project", guestName: "Nadia & Arif", attendanceStatus: "ATTENDING", guestCount: 2, message: "Bahagia selalu untuk kalian berdua.", submittedAt: now() }, { projectId: "demo-project", guestName: "Rizky", attendanceStatus: "NOT_ATTENDING", guestCount: 0, message: "Maaf belum bisa hadir, selamat ya!", submittedAt: now() }]).run();
}

export const PROJECT_ID = "demo-project";

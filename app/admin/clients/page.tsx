"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mail, Plus, RefreshCw, UserRound } from "lucide-react";
import { AdminShell } from "../../../components/dashboard-shell";
import { Badge, Button, Card, Input } from "../../../components/ui";

type Client = { id: string; name: string; email: string; role: string; createdAt: number };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  async function loadClients() {
    setLoading(true); setError("");
    const response = await fetch("/api/admin/clients");
    const result = await response.json().catch(() => ({}));
    if (!response.ok) setError(result.error || "Gagal memuat client.");
    else setClients(result.data || []);
    setLoading(false);
  }
  useEffect(() => {
    let active = true;
    fetch("/api/admin/clients").then(async response => {
      const result = await response.json().catch(() => ({}));
      if (!active) return;
      if (!response.ok) setError(result.error || "Gagal memuat client.");
      else setClients(result.data || []);
      setLoading(false);
    }).catch(() => { if (active) { setError("Gagal memuat client."); setLoading(false); } });
    return () => { active = false; };
  }, []);

  async function createClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setFormError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/admin/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) setFormError(result.error || "Client gagal dibuat.");
    else { setOpen(false); event.currentTarget.reset(); await loadClients(); }
    setSaving(false);
  }

  return <AdminShell><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-gold">Administration</p><h1 className="mt-2 font-display text-4xl">Clients</h1><p className="mt-2 text-sm text-stone-500">Buat akun client dan kelola akses workspace mereka.</p></div><Button className="w-fit bg-ink text-white" onClick={() => { setFormError(""); setOpen(true); }}><Plus size={15}/> Tambah client</Button></div>
    <Card className="mt-8 overflow-hidden"><div className="flex items-center justify-between border-b border-stone-100 p-5"><p className="text-sm font-bold">Daftar client</p><Button className="h-8 px-3 text-xs text-stone-500" onClick={() => void loadClients()}><RefreshCw size={13}/> Muat ulang</Button></div>
      {loading ? <div className="p-8 text-sm text-stone-500">Memuat data client...</div> : error ? <div className="p-8"><p className="text-sm text-red-600">{error}</p><Button className="mt-4 border border-stone-200" onClick={() => void loadClients()}>Coba lagi</Button></div> : clients.length === 0 ? <div className="p-10 text-center"><UserRound className="mx-auto text-stone-300"/><p className="mt-3 text-sm font-semibold">Belum ada client</p><p className="mt-1 text-xs text-stone-500">Buat akun client pertama untuk memulai.</p></div> : <div className="divide-y divide-stone-100">{clients.map(client => <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center" key={client.id}><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sand font-display text-lg">{client.name.charAt(0).toUpperCase()}</div><div className="flex-1"><p className="text-sm font-bold">{client.name}</p><p className="mt-1 flex items-center gap-1 text-xs text-stone-500"><Mail size={12}/>{client.email}</p></div><Badge tone="green">{client.role}</Badge><p className="text-xs text-stone-400">Bergabung {new Date(client.createdAt).toLocaleDateString("id-ID")}</p></div>)}</div>}
    </Card>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-5"><Card className="w-full max-w-md p-6"><div className="flex items-start justify-between"><div><h2 className="font-display text-2xl">Tambah client</h2><p className="mt-1 text-xs text-stone-500">Client dapat login menggunakan email dan password ini.</p></div><button className="text-sm text-stone-400" onClick={() => setOpen(false)}>Tutup</button></div><form className="mt-6 space-y-4" onSubmit={createClient}><label className="block text-sm font-semibold">Nama<Input name="name" className="mt-2" placeholder="Nama client" required/></label><label className="block text-sm font-semibold">Email<Input name="email" className="mt-2" type="email" placeholder="client@email.com" required/></label><label className="block text-sm font-semibold">Password<Input name="password" className="mt-2" type="password" minLength={8} placeholder="Minimal 8 karakter" required/></label>{formError && <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{formError}</p>}<div className="flex justify-end gap-2"><Button type="button" className="border border-stone-200" onClick={() => setOpen(false)}>Batal</Button><Button disabled={saving} className="bg-ink text-white">{saving ? "Menyimpan..." : "Buat client"}</Button></div></form></Card></div>}
  </AdminShell>;
}

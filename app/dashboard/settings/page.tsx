"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button, Card, Input } from "../../../components/ui";
import { useActiveProject } from "../../../components/project-context";

export default function Settings() {
  const project = useActiveProject(); const [form, setForm] = useState({ name: "", coupleName: "", eventDate: "", invitationUrl: "", coverImageUrl: "" }); const [notice, setNotice] = useState("");
  useEffect(() => { if (project) setForm({ name: project.name, coupleName: project.coupleName, eventDate: project.eventDate, invitationUrl: project.invitationUrl, coverImageUrl: project.coverImageUrl || "" }); }, [project]);
  const update = (key: keyof typeof form, value: string) => setForm(current => ({ ...current, [key]: value }));
  const save = async () => { if (!project) return; const response = await fetch(`/api/projects/${project.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const result = await response.json(); setNotice(response.ok ? "Pengaturan berhasil disimpan." : result.error || "Pengaturan gagal disimpan."); };
  return <div className="max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-gold">Workspace</p><h1 className="mt-2 font-display text-4xl">Pengaturan</h1><p className="mt-2 text-sm text-stone-500">Atur detail undanganmu.</p>{notice && <p className="mt-4 rounded-lg bg-stone-100 p-3 text-xs text-stone-700">{notice}</p>}<Card className="mt-8 p-6"><h2 className="text-lg font-bold">Informasi undangan</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Nama project<Input className="mt-2" value={form.name} onChange={e => update("name", e.target.value)} /></label><label className="text-sm font-semibold">Nama pasangan<Input className="mt-2" value={form.coupleName} onChange={e => update("coupleName", e.target.value)} /></label><label className="text-sm font-semibold">Tanggal acara<Input className="mt-2" type="date" value={form.eventDate} onChange={e => update("eventDate", e.target.value)} /></label><label className="text-sm font-semibold">URL undangan<Input className="mt-2" value={form.invitationUrl} onChange={e => update("invitationUrl", e.target.value)} /></label><label className="text-sm font-semibold sm:col-span-2">URL thumbnail kecil<Input className="mt-2" placeholder="https://..." value={form.coverImageUrl} onChange={e => update("coverImageUrl", e.target.value)} /></label></div><Button className="mt-6 bg-ink text-white" onClick={() => void save()}><Save size={15}/> Simpan perubahan</Button></Card></div>;
}

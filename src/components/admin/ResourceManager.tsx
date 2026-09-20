"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, LoadingBlock, EmptyBlock, ErrorBlock } from "./ui";

/** Field schema describing how to render/edit one column of a resource. */
export interface FieldDef {
  name: string;
  label: string;
  type?: "text" | "textarea" | "number" | "url" | "tags" | "toggle" | "select";
  options?: string[]; // for select
  placeholder?: string;
  // Show this field in the table list (first ~3 recommended).
  inTable?: boolean;
  // Render helper for table cell.
  format?: (v: unknown, row: Record<string, unknown>) => string;
}

export interface ResourceManagerProps {
  title: string;
  subtitle: string;
  endpoint: string; // e.g. /api/admin/projects
  fields: FieldDef[];
  idField?: string;
  singular: string; // "Project"
}

type Row = Record<string, unknown>;

export function ResourceManager({ title, subtitle, endpoint, fields, singular }: ResourceManagerProps) {
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbConfigured, setDbConfigured] = useState(true);

  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch(endpoint)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setItems(d.items ?? []);
          setDbConfigured(d.dbConfigured !== false);
        } else setError(d.error || "Failed to load.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

  const tableFields = fields.filter((f) => f.inTable).slice(0, 4);

  async function save(form: Row, isCreate: boolean) {
    setSaving(true);
    try {
      const payload: Row = { ...form, _action: isCreate ? "create" : "update" };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (d.success) {
        setEditing(null);
        setCreating(false);
        load();
      } else {
        alert(d.error || "Save failed.");
      }
    } catch {
      alert("Network error.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Row) {
    const id = String(row.id);
    if (!confirm(`Delete this ${singular.toLowerCase()}? This cannot be undone.`)) return;
    setBusyId(id);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: "delete", id }),
      });
      const d = await res.json();
      if (d.success) load();
      else alert(d.error || "Delete failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-[#8b8797]">{subtitle}</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          disabled={!dbConfigured}
          className="rounded-lg bg-gradient-to-r from-[#ec4899] to-[#a855f7] px-3.5 py-2 text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          + New {singular}
        </button>
      </div>

      {!dbConfigured && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-300">
          Database not configured — content management is read-only. Set the Turso env vars to enable saving.
        </div>
      )}

      {loading ? (
        <LoadingBlock label={`Loading ${title.toLowerCase()}...`} />
      ) : error ? (
        <ErrorBlock message={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyBlock title={`No ${singular.toLowerCase()}s yet.`} hint={`Click "New ${singular}" to add one.`} />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] uppercase tracking-wider text-[#8b8797]">
                  {tableFields.map((f) => (
                    <th key={f.name} className="px-4 py-3 text-left font-medium">{f.label}</th>
                  ))}
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={String(row.id)} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    {tableFields.map((f, i) => (
                      <td key={f.name} className={`px-4 py-3 ${i === 0 ? "font-medium text-white" : "text-[#a5a1b3]"}`}>
                        <span className="line-clamp-1 max-w-[280px]">{cellValue(f, row)}</span>
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditing(row)}
                          className="rounded-md border border-white/10 px-2.5 py-1 text-[11px] text-[#c9c5d6] hover:border-[#ec4899]/40 hover:text-white"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => remove(row)}
                          disabled={busyId === String(row.id)}
                          className="rounded-md border border-[#fb7185]/20 px-2.5 py-1 text-[11px] text-[#fb7185] hover:bg-[#fb7185]/10 disabled:opacity-50"
                        >
                          {busyId === String(row.id) ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {(creating || editing) && (
        <EditorModal
          singular={singular}
          fields={fields}
          initial={editing ?? {}}
          isCreate={creating}
          saving={saving}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSave={(form) => save(form, creating)}
        />
      )}
    </div>
  );
}

function cellValue(f: FieldDef, row: Row): string {
  const v = row[f.name];
  if (f.format) return f.format(v, row);
  if (f.type === "toggle") return v ? "Yes" : "No";
  if (f.type === "tags") {
    try { const arr = JSON.parse(String(v || "[]")); return Array.isArray(arr) ? arr.join(", ") : String(v ?? ""); }
    catch { return String(v ?? ""); }
  }
  return v == null || v === "" ? "—" : String(v);
}

function EditorModal({
  singular, fields, initial, isCreate, saving, onCancel, onSave,
}: {
  singular: string;
  fields: FieldDef[];
  initial: Row;
  isCreate: boolean;
  saving: boolean;
  onCancel: () => void;
  onSave: (form: Row) => void;
}) {
  const [form, setForm] = useState<Row>(() => {
    const f: Row = { ...initial };
    // Normalize tags to a comma string for editing.
    fields.forEach((fd) => {
      if (fd.type === "tags") {
        try { const arr = JSON.parse(String(initial[fd.name] || "[]")); f[fd.name] = Array.isArray(arr) ? arr.join(", ") : ""; }
        catch { f[fd.name] = String(initial[fd.name] ?? ""); }
      }
    });
    return f;
  });

  function set(name: string, value: unknown) { setForm((p) => ({ ...p, [name]: value })); }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const out: Row = { id: initial.id };
    fields.forEach((f) => {
      let v = form[f.name];
      if (f.type === "tags") {
        v = String(v ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      } else if (f.type === "toggle") {
        v = v ? 1 : 0;
      } else if (f.type === "number") {
        v = Number(v ?? 0);
      }
      out[f.name] = v;
    });
    onSave(out);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <form
        onSubmit={submit}
        className="relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.1] bg-[#0d0b12] p-5 scroll-subtle"
      >
        <h3 className="mb-4 text-base font-semibold text-white">{isCreate ? `New ${singular}` : `Edit ${singular}`}</h3>
        <div className="space-y-3.5">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="mb-1 block text-[11px] font-medium text-[#a5a1b3]">{f.label}</label>
              {f.type === "textarea" ? (
                <textarea
                  value={String(form[f.name] ?? "")}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  rows={4}
                  className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-[#5a5766] focus:border-[#ec4899]/50"
                />
              ) : f.type === "toggle" ? (
                <button
                  type="button"
                  onClick={() => set(f.name, form[f.name] ? 0 : 1)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${form[f.name] ? "bg-[#ec4899]" : "bg-white/10"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${form[f.name] ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                </button>
              ) : f.type === "select" ? (
                <select
                  value={String(form[f.name] ?? f.options?.[0] ?? "")}
                  onChange={(e) => set(f.name, e.target.value)}
                  className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#ec4899]/50"
                >
                  {(f.options ?? []).map((o) => <option key={o} value={o} className="bg-[#0d0b12]">{o}</option>)}
                </select>
              ) : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  value={String(form[f.name] ?? "")}
                  onChange={(e) => set(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-white/[0.08] bg-black/30 px-3 py-2 text-sm text-white outline-none placeholder:text-[#5a5766] focus:border-[#ec4899]/50"
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-lg border border-white/10 px-4 py-2 text-[12px] text-[#c9c5d6] hover:bg-white/5">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-lg bg-gradient-to-r from-[#ec4899] to-[#a855f7] px-4 py-2 text-[12px] font-semibold text-white hover:opacity-90 disabled:opacity-60">
            {saving ? "Saving..." : isCreate ? "Create" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

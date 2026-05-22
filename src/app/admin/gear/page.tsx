"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getAllLoadouts,
  createLoadout,
  updateLoadout,
  deleteLoadout,
} from "@/lib/data";
import type { Loadout } from "@/lib/types";

/** Empty form state for creating a new loadout */
const EMPTY_FORM: Omit<Loadout, "id" | "sort_order" | "created_at" | "updated_at"> = {
  name: "",
  camera_body: "",
  lens: "",
  settings: "",
  accessories: "",
  notes: "",
};

export default function GearPage() {
  const [loadouts, setLoadouts] = useState<Loadout[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchLoadouts = useCallback(async () => {
    const data = await getAllLoadouts();
    setLoadouts(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLoadouts();
  }, [fetchLoadouts]);

  // ─── Open modal for create / edit ─────────────────────
  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(loadout: Loadout) {
    setEditingId(loadout.id);
    setForm({
      name: loadout.name,
      camera_body: loadout.camera_body,
      lens: loadout.lens,
      settings: loadout.settings,
      accessories: loadout.accessories,
      notes: loadout.notes,
    });
    setShowModal(true);
  }

  // ─── Save (create or update) ──────────────────────────
  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);

    if (editingId) {
      await updateLoadout(editingId, form);
    } else {
      await createLoadout(form);
    }

    setSaving(false);
    setShowModal(false);
    fetchLoadouts();
  }

  // ─── Delete ───────────────────────────────────────────
  async function handleDelete(id: string) {
    if (!confirm("Delete this loadout? Photos using it will keep their other data but lose the loadout reference.")) {
      return;
    }
    await deleteLoadout(id);
    fetchLoadouts();
  }

  // ─── Form field helper ────────────────────────────────
  function field(
    label: string,
    key: keyof typeof form,
    placeholder: string,
    multiline = false
  ) {
    const baseClass =
      "w-full bg-[var(--bg-tertiary)] border border-white/5 px-3 py-2 text-sm text-[var(--text-primary)] focus:border-[var(--accent)] focus:outline-none rounded-sm";

    return (
      <div>
        <label className="block text-xs tracking-widest uppercase text-[var(--text-muted)] mb-2">
          {label}
        </label>
        {multiline ? (
          <textarea
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            placeholder={placeholder}
            rows={3}
            className={`${baseClass} resize-none`}
          />
        ) : (
          <input
            type="text"
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            placeholder={placeholder}
            className={baseClass}
          />
        )}
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-light tracking-wider text-[var(--text-primary)]">
            Gear &amp; Loadouts
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {loadouts.length} loadout{loadouts.length !== 1 ? "s" : ""} · Assign
            to photos during upload
          </p>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[var(--accent)] text-black px-4 py-2 text-xs tracking-widest uppercase hover:bg-[var(--accent-hover)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Loadout
        </button>
      </div>

      {/* Empty state */}
      {loadouts.length === 0 ? (
        <div className="text-center py-24 bg-[var(--bg-secondary)] border border-white/5 rounded-sm border-dashed">
          <svg
            width="48" height="48" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="0.5"
            className="mx-auto text-[var(--text-muted)] mb-4"
          >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="3" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <line x1="12" y1="19" x2="12" y2="22" />
            <line x1="2" y1="12" x2="5" y2="12" />
            <line x1="19" y1="12" x2="22" y2="12" />
          </svg>
          <p className="text-[var(--text-muted)] text-sm tracking-wider mb-4">
            No loadouts yet. Create your first gear configuration.
          </p>
          <button
            onClick={openCreate}
            className="inline-block border border-[var(--accent)] px-6 py-2 text-xs tracking-widest uppercase text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black transition-all duration-300"
          >
            Create Loadout
          </button>
        </div>
      ) : (
        /* Loadout cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadouts.map((loadout) => (
            <div
              key={loadout.id}
              className="group bg-[var(--bg-secondary)] border border-white/5 rounded-sm p-5 hover:border-white/10 transition-all"
            >
              {/* Name */}
              <h3 className="text-sm font-light tracking-wider text-[var(--text-primary)] mb-3">
                {loadout.name}
              </h3>

              {/* Details */}
              <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
                {loadout.camera_body && (
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-secondary)] w-16 shrink-0">Camera</span>
                    <span className="truncate">{loadout.camera_body}</span>
                  </div>
                )}
                {loadout.lens && (
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-secondary)] w-16 shrink-0">Lens</span>
                    <span className="truncate">{loadout.lens}</span>
                  </div>
                )}
                {loadout.settings && (
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-secondary)] w-16 shrink-0">Settings</span>
                    <span className="truncate">{loadout.settings}</span>
                  </div>
                )}
                {loadout.accessories && (
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-secondary)] w-16 shrink-0">Extras</span>
                    <span className="truncate">{loadout.accessories}</span>
                  </div>
                )}
                {loadout.notes && (
                  <p className="mt-2 pt-2 border-t border-white/5 text-[var(--text-muted)] line-clamp-2">
                    {loadout.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(loadout)}
                  className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] tracking-wider transition-colors"
                >
                  Edit
                </button>
                <span className="text-white/10">·</span>
                <button
                  onClick={() => handleDelete(loadout.id)}
                  className="text-xs text-[var(--text-muted)] hover:text-red-400 tracking-wider transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-secondary)] border border-white/10 rounded-sm w-full max-w-lg p-6 animate-slide-up">
            <h3 className="text-sm font-light tracking-widest uppercase text-[var(--text-primary)] mb-6">
              {editingId ? "Edit Loadout" : "New Loadout"}
            </h3>

            <div className="space-y-4">
              {field("Name *", "name", "e.g. Wildlife Prime Kit")}
              {field("Camera Body", "camera_body", "e.g. Sony A7IV")}
              {field("Lens", "lens", "e.g. 70-200mm f/2.8 GM")}
              {field("Settings", "settings", "e.g. f/2.8, 1/1000s, ISO 400")}
              {field("Tripod / Accessories", "accessories", "e.g. Peak Design Travel Tripod")}
              {field("Notes", "notes", "Any additional notes...", true)}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="bg-[var(--accent)] text-black px-6 py-2 text-xs tracking-widest uppercase hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] px-6 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

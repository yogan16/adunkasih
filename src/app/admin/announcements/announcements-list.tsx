"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Megaphone } from "lucide-react";
import styles from "../admin.module.css";

type Announcement = { id: string; text: string; createdAt: string };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AnnouncementsList({ announcements }: { announcements: Announcement[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [deleteItem, setDeleteItem] = useState<Announcement | null>(null);

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          Senarai Pengumuman ({announcements.length})
          <button type="button" className={styles.addBtn} onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Tambah Pengumuman
          </button>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Teks Pengumuman</th>
                  <th>Tarikh</th>
                  <th>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {announcements.length === 0 ? (
                  <tr className={styles.emptyRow}>
                    <td colSpan={3}>Tiada pengumuman ditemui.</td>
                  </tr>
                ) : (
                  announcements.map((a) => (
                    <tr key={a.id}>
                      <td style={{ maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.text}
                      </td>
                      <td>{formatDate(a.createdAt)}</td>
                      <td>
                        <div className={styles.rowActions}>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => setEditItem(a)}
                            aria-label="Kemaskini"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className={styles.iconBtn}
                            onClick={() => setDeleteItem(a)}
                            aria-label="Padam"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCreate && (
        <AnnouncementFormModal mode="create" onClose={() => setShowCreate(false)} onDone={() => router.refresh()} />
      )}
      {editItem && (
        <AnnouncementFormModal
          mode="edit"
          item={editItem}
          onClose={() => setEditItem(null)}
          onDone={() => router.refresh()}
        />
      )}
      {deleteItem && (
        <DeleteAnnouncementModal item={deleteItem} onClose={() => setDeleteItem(null)} onDone={() => router.refresh()} />
      )}
    </>
  );
}

function AnnouncementFormModal({
  mode,
  item,
  onClose,
  onDone,
}: {
  mode: "create" | "edit";
  item?: Announcement;
  onClose: () => void;
  onDone: () => void;
}) {
  const [text, setText] = useState(item?.text ?? "");
  const [errors, setErrors] = useState<Partial<Record<"text", string[]>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setLoading(true);

    const url = mode === "create" ? "/api/admin/announcements" : `/api/admin/announcements/${item!.id}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      if (typeof data?.error === "string") {
        setFormError(data.error);
      } else {
        setErrors(data?.error ?? {});
      }
      return;
    }

    onDone();
    onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalIconWrap}>
          <Megaphone size={22} />
        </div>
        <h3 className={styles.modalTitle}>{mode === "create" ? "Tambah Pengumuman" : "Kemaskini Pengumuman"}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <label htmlFor="ann-text">Teks Pengumuman</label>
            <textarea
              id="ann-text"
              className={styles.input}
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
            {errors.text?.map((err) => (
              <p key={err} className={styles.fieldError}>
                {err}
              </p>
            ))}
          </div>

          {formError && <p className={styles.formError}>{formError}</p>}

          <div className={styles.modalButtonRow}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Batal
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? "MENYIMPAN..." : mode === "create" ? "TAMBAH" : "SIMPAN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteAnnouncementModal({
  item,
  onClose,
  onDone,
}: {
  item: Announcement;
  onClose: () => void;
  onDone: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setFormError(null);
    setLoading(true);

    const res = await fetch(`/api/admin/announcements/${item.id}`, { method: "DELETE" });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setFormError(data?.error ?? "Gagal memadam pengumuman.");
      return;
    }

    onDone();
    onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h3 className={styles.modalTitle}>Padam Pengumuman</h3>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
        <p style={{ fontSize: 14, color: "#333", marginTop: -8 }}>
          Adakah anda pasti mahu memadam pengumuman ini? Tindakan ini tidak boleh dibatalkan.
        </p>
        {formError && <p className={styles.formError}>{formError}</p>}
        <div className={styles.modalButtonRow}>
          <button type="button" className={styles.btnCancel} onClick={onClose}>
            Batal
          </button>
          <button type="button" className={styles.btnDanger} onClick={handleDelete} disabled={loading}>
            {loading ? "MEMADAM..." : "PADAM"}
          </button>
        </div>
      </div>
    </div>
  );
}

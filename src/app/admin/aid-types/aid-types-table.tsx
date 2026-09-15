"use client";

import { useState, useMemo, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Search, HeartHandshake, PenSquare } from "lucide-react";
import styles from "../admin.module.css";

type AidTypeRow = {
  id: string;
  name: string;
  conditions: string;
  eligibleAge: number;
  amount: number;
  description: string;
  applicationCount: number;
};

type FormErrors = Partial<Record<"name" | "conditions" | "eligibleAge" | "amount" | "description", string[]>>;

export function AidTypesTable({ aidTypes }: { aidTypes: AidTypeRow[] }) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<AidTypeRow | null>(null);
  const [deleteItem, setDeleteItem] = useState<AidTypeRow | null>(null);
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return aidTypes;
    return aidTypes.filter((a) => a.name.toLowerCase().includes(q));
  }, [aidTypes, search]);

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          Senarai Jenis Bantuan ({visible.length})
          <button type="button" className={styles.addBtn} onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Tambah Jenis Bantuan
          </button>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.searchRow}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cari mengikut nama jenis bantuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>Syarat</th>
                  <th>Umur Layak</th>
                  <th>Jumlah (RM)</th>
                  <th>Permohonan</th>
                  <th>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr className={styles.emptyRow}>
                    <td colSpan={6}>Tiada jenis bantuan ditemui.</td>
                  </tr>
                ) : (
                  visible.map((a) => (
                    <tr key={a.id}>
                      <td>{a.name}</td>
                      <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {a.conditions}
                      </td>
                      <td>{a.eligibleAge === 0 ? "Tiada had umur" : `${a.eligibleAge}+`}</td>
                      <td>{a.amount.toFixed(2)}</td>
                      <td>{a.applicationCount}</td>
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

      {showCreate && <AidTypeFormModal mode="create" onClose={() => setShowCreate(false)} onDone={() => router.refresh()} />}
      {editItem && (
        <AidTypeFormModal mode="edit" item={editItem} onClose={() => setEditItem(null)} onDone={() => router.refresh()} />
      )}
      {deleteItem && (
        <DeleteAidTypeModal item={deleteItem} onClose={() => setDeleteItem(null)} onDone={() => router.refresh()} />
      )}
    </>
  );
}

function AidTypeFormModal({
  mode,
  item,
  onClose,
  onDone,
}: {
  mode: "create" | "edit";
  item?: AidTypeRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [conditions, setConditions] = useState(item?.conditions ?? "");
  const [eligibleAge, setEligibleAge] = useState(item ? String(item.eligibleAge) : "0");
  const [amount, setAmount] = useState(item ? String(item.amount) : "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setLoading(true);

    const url = mode === "create" ? "/api/admin/aid-types" : `/api/admin/aid-types/${item!.id}`;
    const res = await fetch(url, {
      method: mode === "create" ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, conditions, eligibleAge, amount, description }),
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
          {mode === "create" ? <HeartHandshake size={22} /> : <PenSquare size={22} />}
        </div>
        <h3 className={styles.modalTitle}>{mode === "create" ? "Tambah Jenis Bantuan" : "Kemaskini Jenis Bantuan"}</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <label htmlFor="at-name">Nama Jenis Bantuan</label>
            <input
              type="text"
              id="at-name"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            {errors.name?.map((err) => (
              <p key={err} className={styles.fieldError}>
                {err}
              </p>
            ))}
          </div>
          <div className={styles.formRow}>
            <label htmlFor="at-conditions">Syarat Kelayakan</label>
            <input
              type="text"
              id="at-conditions"
              className={styles.input}
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              required
            />
            {errors.conditions?.map((err) => (
              <p key={err} className={styles.fieldError}>
                {err}
              </p>
            ))}
          </div>
          <div className={styles.formRow}>
            <label htmlFor="at-age">Umur Layak (0 = tiada had umur)</label>
            <input
              type="number"
              id="at-age"
              className={styles.input}
              value={eligibleAge}
              onChange={(e) => setEligibleAge(e.target.value)}
              min={0}
              required
            />
            {errors.eligibleAge?.map((err) => (
              <p key={err} className={styles.fieldError}>
                {err}
              </p>
            ))}
          </div>
          <div className={styles.formRow}>
            <label htmlFor="at-amount">Jumlah Bantuan (RM)</label>
            <input
              type="number"
              id="at-amount"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
              step="0.01"
              required
            />
            {errors.amount?.map((err) => (
              <p key={err} className={styles.fieldError}>
                {err}
              </p>
            ))}
          </div>
          <div className={styles.formRow}>
            <label htmlFor="at-description">Penerangan</label>
            <textarea
              id="at-description"
              className={styles.input}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            {errors.description?.map((err) => (
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

function DeleteAidTypeModal({
  item,
  onClose,
  onDone,
}: {
  item: AidTypeRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setFormError(null);
    setLoading(true);

    const res = await fetch(`/api/admin/aid-types/${item.id}`, { method: "DELETE" });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setFormError(data?.error ?? "Gagal memadam jenis bantuan.");
      return;
    }

    onDone();
    onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h3 className={styles.modalTitle}>Padam Jenis Bantuan</h3>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
        <p style={{ fontSize: 14, color: "#333", marginTop: -8 }}>
          Adakah anda pasti mahu memadam <strong>{item.name}</strong>? Tindakan ini tidak boleh dibatalkan.
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

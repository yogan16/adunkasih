"use client";

import { useState, useMemo, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Search, Wallet } from "lucide-react";
import styles from "../admin.module.css";

type AdunBudgetRow = { id: string; name: string; allocatedAmount: number };

function formatRM(amount: number) {
  return `RM ${amount.toLocaleString("ms-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AdunBudgetsTable({ aduns }: { aduns: AdunBudgetRow[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<AdunBudgetRow | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return aduns;
    return aduns.filter((a) => a.name.toLowerCase().includes(q));
  }, [aduns, search]);

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>Peruntukan Mengikut ADUN ({visible.length})</div>
        <div className={styles.panelBody}>
          <div className={styles.searchRow}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cari mengikut nama ADUN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ADUN</th>
                  <th>Peruntukan (RM)</th>
                  <th>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr className={styles.emptyRow}>
                    <td colSpan={3}>Tiada ADUN ditemui.</td>
                  </tr>
                ) : (
                  visible.map((a) => (
                    <tr key={a.id}>
                      <td>{a.name}</td>
                      <td>{formatRM(a.allocatedAmount)}</td>
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

      {editItem && (
        <EditBudgetModal item={editItem} onClose={() => setEditItem(null)} onDone={() => router.refresh()} />
      )}
    </>
  );
}

function EditBudgetModal({
  item,
  onClose,
  onDone,
}: {
  item: AdunBudgetRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState(String(item.allocatedAmount));
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);

    const res = await fetch(`/api/admin/adun-budgets/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allocatedAmount: amount }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setFormError(typeof data?.error === "string" ? data.error : "Gagal menyimpan peruntukan.");
      return;
    }

    onDone();
    onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalIconWrap}>
          <Wallet size={22} />
        </div>
        <h3 className={styles.modalTitle}>Kemaskini Peruntukan</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <label htmlFor="budget-adun">ADUN</label>
            <input type="text" id="budget-adun" className={styles.input} value={item.name} disabled />
          </div>
          <div className={styles.formRow}>
            <label htmlFor="budget-amount">Jumlah Peruntukan (RM)</label>
            <input
              type="number"
              id="budget-amount"
              className={styles.input}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
              step="0.01"
              required
            />
          </div>

          {formError && <p className={styles.formError}>{formError}</p>}

          <div className={styles.modalButtonRow}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Batal
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? "MENYIMPAN..." : "SIMPAN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

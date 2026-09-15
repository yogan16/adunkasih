"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Trash2, X, MessageSquare } from "lucide-react";
import styles from "../admin.module.css";

type Message = {
  id: string;
  name: string;
  phone: string;
  comment: string;
  createdAt: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FeedbackList({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [viewMessage, setViewMessage] = useState<Message | null>(null);
  const [deleteMessage, setDeleteMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!deleteMessage) return;
    setLoading(true);
    await fetch(`/api/admin/feedback/${deleteMessage.id}`, { method: "DELETE" });
    setLoading(false);
    setDeleteMessage(null);
    setViewMessage(null);
    router.refresh();
  }

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>Mesej Daripada Orang Ramai ({messages.length})</div>
      <div className={styles.panelBody}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nama</th>
                <th>No. Tel</th>
                <th>Mesej</th>
                <th>Tarikh</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {messages.length === 0 ? (
                <tr className={styles.emptyRow}>
                  <td colSpan={5}>Tiada mesej maklum balas buat masa ini.</td>
                </tr>
              ) : (
                messages.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.phone}</td>
                    <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {m.comment}
                    </td>
                    <td>{formatDate(m.createdAt)}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => setViewMessage(m)}
                          aria-label="Lihat"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => setDeleteMessage(m)}
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

      {viewMessage && (
        <div className={styles.modalOverlay} onClick={() => setViewMessage(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <h3 className={styles.modalTitle}>
                <MessageSquare size={16} style={{ verticalAlign: -2, marginRight: 8 }} />
                {viewMessage.name}
              </h3>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setViewMessage(null)}
                aria-label="Tutup"
              >
                <X size={16} />
              </button>
            </div>
            <p className={styles.feedbackMeta}>
              {viewMessage.phone} &middot; {formatDate(viewMessage.createdAt)}
            </p>
            <p className={styles.feedbackComment}>{viewMessage.comment}</p>
            <div className={styles.modalButtonRow}>
              <button type="button" className={styles.btnCancel} onClick={() => setViewMessage(null)}>
                Tutup
              </button>
              <button
                type="button"
                className={styles.btnDanger}
                onClick={() => {
                  setDeleteMessage(viewMessage);
                  setViewMessage(null);
                }}
              >
                Padam
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteMessage && (
        <div className={styles.modalOverlay} onClick={() => setDeleteMessage(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Padam Mesej</h3>
            <p style={{ fontSize: 14, color: "#333", marginTop: -8 }}>
              Adakah anda pasti mahu memadam mesej daripada <strong>{deleteMessage.name}</strong>?
            </p>
            <div className={styles.modalButtonRow}>
              <button type="button" className={styles.btnCancel} onClick={() => setDeleteMessage(null)}>
                Batal
              </button>
              <button type="button" className={styles.btnDanger} onClick={handleDelete} disabled={loading}>
                {loading ? "MEMADAM..." : "PADAM"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

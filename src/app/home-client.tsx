"use client";

import { useState } from "react";
import { Megaphone, X } from "lucide-react";
import { LegacyHeader } from "@/components/legacy-header";
import { LegacyFooter } from "@/components/legacy-footer";
import styles from "./home.module.css";

const MAX_LENGTH = 70;

type Announcement = {
  id: string;
  text: string;
  date: string;
};

export function HomeClient({ announcements }: { announcements: Announcement[] }) {
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);

  return (
    <div className={styles.page}>
      <LegacyHeader variant="transparent" />

      <main>
        <h2 className={styles.heading2}>Portal Rasmi</h2>
        <h1 className={styles.heading1}>
          ADUNKASIH @ KEDAH <br />
          2024
        </h1>
        <div style={{ textAlign: "center" }}>
          <div className={styles.innovativeSystem}>- SISTEM KEBAJIKAN YANG INOVATIF -</div>
        </div>

        <div className={styles.announcementContainer}>
          <div className={styles.announcementTab}>PENGUMUMAN TERKINI</div>
          <div className={styles.announcementLine} />
        </div>

        <div className={styles.announcementsWrapper}>
          {announcements.map((a) => (
            <div key={a.id} className={styles.contentBox}>
              <div className={styles.announcementRow}>
                <div className={styles.announcementText}>
                  {a.text.length > MAX_LENGTH ? (
                    <>
                      {a.text.slice(0, MAX_LENGTH)}...{" "}
                      <span className={styles.seeAllLink} onClick={() => setActiveAnnouncement(a)}>
                        Lihat selanjutnya
                      </span>
                    </>
                  ) : (
                    a.text
                  )}
                </div>
                <div className={styles.announcementDate}>{a.date}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {activeAnnouncement && (
        <div className={styles.modal} onClick={() => setActiveAnnouncement(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.closeModal}
              onClick={() => setActiveAnnouncement(null)}
              aria-label="Tutup"
            >
              <X size={18} />
            </button>
            <div className={styles.modalIconWrap}>
              <Megaphone size={24} />
            </div>
            <h3 className={styles.modalTitle}>Pengumuman</h3>
            <p className={styles.fullAnnouncementText}>{activeAnnouncement.text}</p>
            <p className={styles.modalDate}>{activeAnnouncement.date}</p>
            <button type="button" className={styles.modalOkBtn} onClick={() => setActiveAnnouncement(null)}>
              Tutup
            </button>
          </div>
        </div>
      )}

      <LegacyFooter variant="fixed-black" />
    </div>
  );
}

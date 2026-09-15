"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Users, FileCheck2, ShieldCheck, Upload, X, Plus, Trash2, Info } from "lucide-react";
import styles from "./permohonan.module.css";

type Adun = { id: string; name: string };
type AidType = {
  id: string;
  name: string;
  conditions: string;
  eligibleAge: number;
  amount: number;
  description: string;
};
type Dependent = { name: string; icNumber: string; relationship: string; income: number };

function calculateAgeFromIC(ic: string): number | "" {
  if (!ic || ic.replace(/\D/g, "").length < 6) return "";
  const digits = ic.replace(/\D/g, "");
  const yearPart = parseInt(digits.substring(0, 2), 10);
  const monthPart = parseInt(digits.substring(2, 4), 10);
  const dayPart = parseInt(digits.substring(4, 6), 10);
  const now = new Date();
  const currentYearTwoDigits = parseInt(now.getFullYear().toString().slice(-2), 10);
  const fullYear = yearPart <= currentYearTwoDigits ? 2000 + yearPart : 1900 + yearPart;
  const birthDate = new Date(fullYear, monthPart - 1, dayPart);
  if (Number.isNaN(birthDate.getTime())) return "";
  let age = now.getFullYear() - fullYear;
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  return age;
}

const MAX_FILE_SIZE = 1024 * 1024; // 1MB

function FileField({
  id,
  label,
  required,
  file,
  error,
  onChange,
}: {
  id: string;
  label: string;
  required?: boolean;
  file: File | null;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.fileField}>
      <label htmlFor={id}>
        {label} (Max 1MB) {required && "*"}
      </label>
      <div className={styles.fileUploadRow}>
        <label htmlFor={id} className={styles.fileUploadBtn}>
          <Upload size={15} />
          {file ? "Tukar Fail" : "Pilih Fail"}
        </label>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept=".pdf"
          className={styles.fileHiddenInput}
          onChange={onChange}
        />
        {file && (
          <span className={styles.fileChip}>
            <FileCheck2 size={14} />
            <span>{file.name}</span>
            <button
              type="button"
              className={styles.fileRemoveBtn}
              aria-label="Buang fail"
              onClick={() => {
                if (inputRef.current) inputRef.current.value = "";
                onChange({ target: { files: null } } as unknown as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              <X size={14} />
            </button>
          </span>
        )}
      </div>
      {error && <p className={styles.fieldError}>{error}</p>}
    </div>
  );
}

export function PermohonanForm({
  user,
  aduns,
  aidTypes,
  pendingAidTypeIds,
}: {
  user: { fullname: string; idNumber: string; phone: string };
  aduns: Adun[];
  aidTypes: AidType[];
  pendingAidTypeIds: string[];
}) {
  const router = useRouter();
  const age = useMemo(() => calculateAgeFromIC(user.idNumber), [user.idNumber]);

  const [gender, setGender] = useState<"" | "Lelaki" | "Perempuan">("");
  const [occupation, setOccupation] = useState("");
  const [incomeRange, setIncomeRange] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("");
  const [address, setAddress] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [adunId, setAdunId] = useState("");

  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [depName, setDepName] = useState("");
  const [depIc, setDepIc] = useState("");
  const [depRelationship, setDepRelationship] = useState("");
  const [depIncome, setDepIncome] = useState("");

  const [aidTypeId, setAidTypeId] = useState("");
  const [otherAidDetail, setOtherAidDetail] = useState("");
  const [description, setDescription] = useState("");
  const [modalAidType, setModalAidType] = useState<AidType | null>(null);

  const [mykadFile, setMykadFile] = useState<File | null>(null);
  const [okuFile, setOkuFile] = useState<File | null>(null);
  const [buktiPendapatanFile, setBuktiPendapatanFile] = useState<File | null>(null);
  const [dokumenTambahanFile, setDokumenTambahanFile] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState<Record<string, string>>({});

  const [confirmCheck, setConfirmCheck] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const depAge = calculateAgeFromIC(depIc);
  const totalDependentIncome = dependents.reduce((sum, d) => sum + d.income, 0);

  function handleFile(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void,
    key: string,
  ) {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > MAX_FILE_SIZE) {
      setFileErrors((prev) => ({ ...prev, [key]: "Saiz fail melebihi 1MB." }));
      setter(null);
      e.target.value = "";
      return;
    }
    setFileErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setter(file);
  }

  function addDependent() {
    if (!depName.trim() || !depRelationship.trim()) {
      setFormError("Sila isi sekurang-kurangnya Nama dan Hubungan tanggungan.");
      return;
    }
    setFormError(null);
    setDependents((prev) => [
      ...prev,
      {
        name: depName.trim(),
        icNumber: depIc.trim(),
        relationship: depRelationship.trim(),
        income: parseFloat(depIncome) || 0,
      },
    ]);
    setDepName("");
    setDepIc("");
    setDepRelationship("");
    setDepIncome("");
  }

  function removeDependent(index: number) {
    setDependents((prev) => prev.filter((_, i) => i !== index));
  }

  function handleAidTypeChange(id: string) {
    setAidTypeId(id);
    const selected = aidTypes.find((a) => a.id === id);
    if (selected && selected.name !== "Lain-lain") {
      setModalAidType(selected);
    }
  }

  function resetForm() {
    setGender("");
    setOccupation("");
    setIncomeRange("");
    setMaritalStatus("");
    setAddress("");
    setPostcode("");
    setCity("");
    setAdunId("");
    setDependents([]);
    setDepName("");
    setDepIc("");
    setDepRelationship("");
    setDepIncome("");
    setAidTypeId("");
    setOtherAidDetail("");
    setDescription("");
    setMykadFile(null);
    setOkuFile(null);
    setBuktiPendapatanFile(null);
    setDokumenTambahanFile(null);
    setFileErrors({});
    setConfirmCheck(false);
    setErrors({});
    setFormError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setErrors({});

    if (!confirmCheck) {
      setFormError("Sila setuju dengan pengisytiharan dan persetujuan terlebih dahulu.");
      return;
    }
    if (!mykadFile) {
      setFormError("Sila muat naik salinan MyKad.");
      return;
    }

    const selectedAidType = aidTypes.find((a) => a.id === aidTypeId);
    if (selectedAidType?.name === "Lain-lain" && !otherAidDetail.trim()) {
      setFormError("Sila nyatakan jenis bantuan yang diperlukan.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/permohonan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gender,
        occupation,
        incomeRange,
        maritalStatus,
        address,
        postcode,
        city,
        adunId,
        aidTypeId,
        otherAidDetail: otherAidDetail.trim() || undefined,
        description,
        dependents,
        hasMykadFile: true,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      if (data?.error && typeof data.error === "object") {
        setErrors(data.error);
        setFormError("Sila semak semula maklumat yang dimasukkan.");
      } else {
        setFormError(typeof data?.error === "string" ? data.error : "Gagal menghantar permohonan. Sila cuba lagi.");
      }
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* SECTION 1: MAKLUMAT PEMOHON */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <User size={17} />
          Maklumat Pemohon
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.formRow}>
            <div className={styles.formColumn}>
              <label htmlFor="namaPemohon">Nama</label>
              <input id="namaPemohon" className={styles.input} value={user.fullname} disabled />

              <label htmlFor="noMykad">No. MyKad</label>
              <input id="noMykad" className={styles.input} value={user.idNumber} disabled />

              <label htmlFor="umur">Umur</label>
              <input id="umur" className={styles.input} value={age} readOnly />

              <label>Jantina</label>
              <div className={styles.radioGroup}>
                <label>
                  <input
                    type="radio"
                    name="jantina"
                    checked={gender === "Lelaki"}
                    onChange={() => setGender("Lelaki")}
                    required
                  />
                  Lelaki
                </label>
                <label>
                  <input
                    type="radio"
                    name="jantina"
                    checked={gender === "Perempuan"}
                    onChange={() => setGender("Perempuan")}
                  />
                  Perempuan
                </label>
              </div>

              <label htmlFor="noTel">No. Telefon Bimbit</label>
              <input id="noTel" className={styles.input} value={user.phone} disabled />

              <label htmlFor="pekerjaan">Pekerjaan</label>
              <input
                id="pekerjaan"
                className={styles.input}
                placeholder="Pekerjaan Pemohon"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                required
              />

            </div>

            <div className={styles.formColumn}>
              <label htmlFor="pendapatanKasar">Pendapatan Kasar Bulanan Isi Rumah</label>
              <select
                id="pendapatanKasar"
                className={styles.input}
                value={incomeRange}
                onChange={(e) => setIncomeRange(e.target.value)}
                required
              >
                <option value="" disabled>
                  Pilih Pendapatan
                </option>
                <option value="RM0 - RM1500">RM0 - RM1500</option>
                <option value="RM1500 - RM3000">RM1500 - RM3000</option>
                <option value="Above RM3000">Above RM3000</option>
              </select>

              <label htmlFor="statusPerkahwinan">Status Perkahwinan</label>
              <select
                id="statusPerkahwinan"
                className={styles.input}
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                required
              >
                <option value="" disabled>
                  Pilih Status
                </option>
                <option value="Bujang">Bujang</option>
                <option value="Berkahwin">Berkahwin</option>
                <option value="Bercerai">Bercerai</option>
                <option value="Ibu/Bapa Tunggal">Ibu/Bapa Tunggal</option>
              </select>

              <label htmlFor="alamat">Alamat Surat Menyurat</label>
              <textarea
                id="alamat"
                className={styles.input}
                placeholder="Alamat Surat Menyurat"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />

              <label htmlFor="poskod">Poskod</label>
              <input
                id="poskod"
                className={styles.input}
                placeholder="Poskod"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                required
              />

              <label htmlFor="bandar">Bandar</label>
              <input
                id="bandar"
                className={styles.input}
                placeholder="Bandar"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />

              <label htmlFor="adun">Pilih ADUN</label>
              <select
                id="adun"
                className={styles.input}
                value={adunId}
                onChange={(e) => setAdunId(e.target.value)}
                required
              >
                <option value="">Sila pilih ADUN</option>
                {aduns.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              {errors.adunId?.map((err) => (
                <p key={err} className={styles.fieldError}>
                  {err}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: MAKLUMAT TANGGUNGAN */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Users size={17} />
          Maklumat Tanggungan (Pilihan)
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.addDependentRow}>
          <div className={styles.formRow} style={{ marginBottom: 8 }}>
            <div className={styles.formColumn}>
              <label htmlFor="tanggunganNama">Nama Penuh</label>
              <input
                id="tanggunganNama"
                className={styles.input}
                placeholder="Nama Penuh"
                value={depName}
                onChange={(e) => setDepName(e.target.value)}
              />
            </div>
            <div className={styles.formColumn}>
              <label htmlFor="tanggunganMyKad">No. MyKad</label>
              <input
                id="tanggunganMyKad"
                className={styles.input}
                placeholder="Contoh: 020305022536"
                value={depIc}
                onChange={(e) => setDepIc(e.target.value)}
              />
            </div>
            <div className={styles.formColumn}>
              <label htmlFor="tanggunganUmur">Umur</label>
              <input id="tanggunganUmur" className={styles.input} value={depAge} readOnly />
            </div>
            <div className={styles.formColumn}>
              <label htmlFor="tanggunganHubungan">Hubungan</label>
              <input
                id="tanggunganHubungan"
                className={styles.input}
                placeholder="Hubungan"
                value={depRelationship}
                onChange={(e) => setDepRelationship(e.target.value)}
              />
            </div>
            <div className={styles.formColumn}>
              <label htmlFor="tanggunganPendapatan">Pendapatan (RM)</label>
              <input
                id="tanggunganPendapatan"
                type="number"
                min={0}
                className={styles.input}
                placeholder="Pendapatan (RM)"
                value={depIncome}
                onChange={(e) => setDepIncome(e.target.value)}
              />
            </div>
          </div>

          <button type="button" className={styles.addBtn} onClick={addDependent}>
            <Plus size={15} />
            TAMBAH
          </button>
          </div>

          {dependents.length > 0 && (
            <table className={styles.dependentTable}>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>No. MyKad</th>
                  <th>Umur</th>
                  <th>Hubungan</th>
                  <th>Pendapatan</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {dependents.map((d, i) => (
                  <tr key={`${d.name}-${i}`}>
                    <td>{d.name}</td>
                    <td>{d.icNumber || "-"}</td>
                    <td>{calculateAgeFromIC(d.icNumber) || "-"}</td>
                    <td>{d.relationship}</td>
                    <td>{d.income}</td>
                    <td>
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeDependent(i)}
                      >
                        <Trash2 size={13} />
                        Padam
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p className={styles.totalIncome}>
            Jumlah Pendapatan Tanggungan (RM): {totalDependentIncome}
          </p>
        </div>
      </div>

      {/* SECTION 3: BUTIRAN BANTUAN DAN DOKUMEN SOKONGAN */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <FileCheck2 size={17} />
          Butiran Bantuan dan Dokumen Sokongan
        </div>
        <div className={styles.sectionBody}>
          <div className={styles.formRow}>
            <div className={styles.formColumn}>
              <label htmlFor="jenisBantuan">Jenis Bantuan Diperlukan</label>
              <select
                id="jenisBantuan"
                className={styles.input}
                value={aidTypeId}
                onChange={(e) => handleAidTypeChange(e.target.value)}
                required
              >
                <option value="" disabled>
                  Pilih Jenis Bantuan
                </option>
                {aidTypes.map((a) => {
                  const isPending = pendingAidTypeIds.includes(a.id);
                  return (
                    <option key={a.id} value={a.id} disabled={isPending}>
                      {a.name}
                      {isPending ? " (Sedang Diproses)" : ""}
                    </option>
                  );
                })}
              </select>
              {pendingAidTypeIds.length > 0 && (
                <p className={styles.helperNote}>
                  Jenis bantuan bertanda &quot;(Sedang Diproses)&quot; sudah mempunyai permohonan
                  aktif — tunggu keputusan sebelum memohon semula.
                </p>
              )}
              {errors.aidTypeId?.map((err) => (
                <p key={err} className={styles.fieldError}>
                  {err}
                </p>
              ))}

              {aidTypes.find((a) => a.id === aidTypeId)?.name === "Lain-lain" && (
                <>
                  <label htmlFor="lainLain">Jika Pilih (Lain-lain)</label>
                  <input
                    id="lainLain"
                    className={styles.input}
                    placeholder="Nyatakan Jenis Bantuan Diperlukan"
                    value={otherAidDetail}
                    onChange={(e) => setOtherAidDetail(e.target.value)}
                  />
                </>
              )}

              <label htmlFor="huraianBantuan">Penerangan bagi Bantuan yang Diminta</label>
              <textarea
                id="huraianBantuan"
                className={styles.input}
                placeholder="Tulis sebab perlukan bantuan"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className={styles.formColumn}>
              <FileField
                id="mykadFile"
                label="Salinan MyKad"
                required
                file={mykadFile}
                error={fileErrors.mykad}
                onChange={(e) => handleFile(e, setMykadFile, "mykad")}
              />
              <FileField
                id="okuFile"
                label="Salinan Kad OKU"
                file={okuFile}
                error={fileErrors.oku}
                onChange={(e) => handleFile(e, setOkuFile, "oku")}
              />
              <FileField
                id="buktiPendapatan"
                label="Bukti Pendapatan"
                file={buktiPendapatanFile}
                error={fileErrors.bukti}
                onChange={(e) => handleFile(e, setBuktiPendapatanFile, "bukti")}
              />
              <FileField
                id="dokumenTambahan"
                label="Dokumen Tambahan"
                file={dokumenTambahanFile}
                error={fileErrors.tambahan}
                onChange={(e) => handleFile(e, setDokumenTambahanFile, "tambahan")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: PENGISYTIHARAN DAN PERSETUJUAN */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <ShieldCheck size={17} />
          Pengisytiharan dan Persetujuan
        </div>
        <div className={styles.sectionBody}>
          <p>Saya dengan ini mengaku bahawa:</p>
          <ol className={styles.declarationList}>
            <li>
              Semua maklumat dan dokumen sokongan yang diberikan dalam borang permohonan ini
              adalah benar, tepat dan lengkap sepanjang pengetahuan saya.
            </li>
            <li>
              Saya faham bahawa sebarang maklumat palsu, tidak tepat atau tidak lengkap yang
              diberikan boleh mengakibatkan penolakan permohonan ini atau tindakan undang-undang
              diambil terhadap saya.
            </li>
            <li>
              Saya memberi kebenaran kepada pihak yang berkenaan untuk memproses maklumat peribadi
              saya, dan untuk mendedahkan maklumat ini kepada mana-mana pihak ketiga yang
              berkenaan atas keperluan urusan, kecuali jika dikehendaki oleh undang-undang.
            </li>
          </ol>

          <div className={styles.confirmCheck}>
            <input
              type="checkbox"
              id="confirmCheck"
              checked={confirmCheck}
              onChange={(e) => setConfirmCheck(e.target.checked)}
            />
            <label htmlFor="confirmCheck">
              Saya mengesahkan bahawa saya telah membaca dan memberikan persetujuan saya seperti
              yang dinyatakan di atas
            </label>
          </div>

          {formError && <p className={styles.formError}>{formError}</p>}

          <div className={styles.buttonRow}>
            <button type="button" className={styles.btnReset} onClick={resetForm}>
              RESET
            </button>
            <button type="submit" className={styles.btnSubmit} disabled={loading}>
              {loading ? "SEDANG MENGHANTAR..." : "HANTAR"}
            </button>
          </div>
        </div>
      </div>

      {modalAidType && (
        <div className={styles.modalOverlay} onClick={() => setModalAidType(null)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIconWrap}>
              <Info size={28} />
            </div>
            <h2 className={styles.modalTitle}>Butiran Kelayakan</h2>
            <table className={styles.modalTable}>
              <tbody>
                <tr>
                  <th>Jenis Bantuan</th>
                  <td>{modalAidType.name}</td>
                </tr>
                <tr>
                  <th>Syarat</th>
                  <td>{modalAidType.conditions}</td>
                </tr>
                <tr>
                  <th>Umur Kelayakan</th>
                  <td>
                    {modalAidType.eligibleAge > 0
                      ? `${modalAidType.eligibleAge} tahun ke atas`
                      : "Tiada had umur"}
                  </td>
                </tr>
                <tr>
                  <th>Jumlah Agihan</th>
                  <td>RM {modalAidType.amount}</td>
                </tr>
                <tr>
                  <th>Penerangan</th>
                  <td>{modalAidType.description}</td>
                </tr>
              </tbody>
            </table>
            <button type="button" className={styles.modalOkBtn} onClick={() => setModalAidType(null)}>
              OKAY
            </button>
          </div>
        </div>
      )}
    </form>
  );
}

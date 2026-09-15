"use client";

import { useState, useMemo, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Search, UserPlus, UserCog } from "lucide-react";
import { PasswordInput } from "@/components/password-input";
import styles from "../admin.module.css";

type Role = "CITIZEN" | "PEGAWAI" | "ADMIN" | "WAKIL_ADUN";
type AdunOption = { id: string; name: string };
type UserRow = {
  id: string;
  fullname: string;
  idNumber: string;
  phone: string;
  role: Role;
  createdAt: string;
  adunId: string | null;
  adunName: string | null;
};

const ROLE_LABEL: Record<Role, string> = {
  CITIZEN: "Warganegara",
  PEGAWAI: "Pegawai",
  ADMIN: "Pentadbir",
  WAKIL_ADUN: "Wakil ADUN",
};
const ROLE_CLASS: Record<Role, string> = {
  CITIZEN: "roleCitizen",
  PEGAWAI: "rolePegawai",
  ADMIN: "roleAdmin",
  WAKIL_ADUN: "roleWakilAdun",
};
const ADUN_SCOPED_ROLES: Role[] = ["PEGAWAI", "WAKIL_ADUN"];
type RoleFilter = Role | "ALL";

type CreateErrors = Partial<Record<"fullname" | "idNumber" | "phone" | "password" | "role" | "adunId", string[]>>;
type UpdateErrors = Partial<Record<"fullname" | "phone" | "role" | "password" | "adunId", string[]>>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ms-MY", { day: "2-digit", month: "short", year: "numeric" });
}

export function UsersTable({
  users,
  aduns,
  currentUserId,
}: {
  users: UserRow[];
  aduns: AdunOption[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserRow | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = users;
    if (q) {
      list = list.filter(
        (u) =>
          u.fullname.toLowerCase().includes(q) ||
          u.idNumber.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q),
      );
    }
    if (roleFilter !== "ALL") {
      list = list.filter((u) => u.role === roleFilter);
    }
    return list;
  }, [users, search, roleFilter]);

  const assignedAdunIdsByRole = useMemo(() => {
    const map: Record<string, Set<string>> = { PEGAWAI: new Set(), WAKIL_ADUN: new Set() };
    for (const u of users) {
      if (ADUN_SCOPED_ROLES.includes(u.role) && u.adunId) {
        map[u.role].add(u.adunId);
      }
    }
    return map;
  }, [users]);

  return (
    <>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          Senarai Pengguna ({visibleUsers.length})
          <button type="button" className={styles.addBtn} onClick={() => setShowCreate(true)}>
            <Plus size={15} />
            Tambah Pengguna
          </button>
        </div>
        <div className={styles.panelBody}>
          <div className={styles.filterRow}>
            <div className={styles.searchRow}>
              <Search size={16} className={styles.searchIcon} />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Cari mengikut nama, No. Kad Pengenalan atau No. Tel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className={styles.roleFilterSelect}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
              aria-label="Tapis mengikut peranan"
            >
              <option value="ALL">Semua Peranan</option>
              <option value="CITIZEN">Warganegara</option>
              <option value="PEGAWAI">Pegawai</option>
              <option value="WAKIL_ADUN">Wakil ADUN</option>
              <option value="ADMIN">Pentadbir</option>
            </select>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nama Penuh</th>
                  <th>No. Kad Pengenalan</th>
                  <th>No. Tel</th>
                  <th>Peranan</th>
                  <th>ADUN</th>
                  <th>Didaftar</th>
                  <th>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.length === 0 ? (
                  <tr className={styles.emptyRow}>
                    <td colSpan={7}>Tiada pengguna ditemui.</td>
                  </tr>
                ) : (
                  visibleUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullname}</td>
                    <td>{u.idNumber}</td>
                    <td>{u.phone || "-"}</td>
                    <td>
                      <span className={`${styles.roleBadge} ${styles[ROLE_CLASS[u.role]]}`}>
                        {ROLE_LABEL[u.role]}
                      </span>
                    </td>
                    <td>{u.adunName ?? "-"}</td>
                    <td>{formatDate(u.createdAt)}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => setEditUser(u)}
                          aria-label="Kemaskini"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => setDeleteUser(u)}
                          disabled={u.id === currentUserId}
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
        <CreateUserModal
          aduns={aduns}
          assignedAdunIdsByRole={assignedAdunIdsByRole}
          onClose={() => setShowCreate(false)}
          onDone={() => router.refresh()}
        />
      )}
      {editUser && (
        <EditUserModal
          user={editUser}
          aduns={aduns}
          assignedAdunIdsByRole={assignedAdunIdsByRole}
          isSelf={editUser.id === currentUserId}
          onClose={() => setEditUser(null)}
          onDone={() => router.refresh()}
        />
      )}
      {deleteUser && (
        <DeleteUserModal user={deleteUser} onClose={() => setDeleteUser(null)} onDone={() => router.refresh()} />
      )}
    </>
  );
}

function CreateUserModal({
  aduns,
  assignedAdunIdsByRole,
  onClose,
  onDone,
}: {
  aduns: AdunOption[];
  assignedAdunIdsByRole: Record<string, Set<string>>;
  onClose: () => void;
  onDone: () => void;
}) {
  const [fullname, setFullname] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [adunId, setAdunId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("PEGAWAI");
  const [errors, setErrors] = useState<CreateErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const assignedForRole = assignedAdunIdsByRole[role] ?? new Set<string>();
  const availableAduns = aduns.filter((a) => !assignedForRole.has(a.id));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setLoading(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname, idNumber, phone, adunId, password, role }),
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

  const isAdunRole = ADUN_SCOPED_ROLES.includes(role);
  const isCitizen = role === "CITIZEN";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalIconWrap}>
          <UserPlus size={22} />
        </div>
        <h3 className={styles.modalTitle}>Tambah Pengguna</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <label htmlFor="c-fullname">Nama Penuh</label>
            <input
              type="text"
              id="c-fullname"
              className={styles.input}
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
            {errors.fullname?.map((err) => (
              <p key={err} className={styles.fieldError}>
                {err}
              </p>
            ))}
          </div>
          <div className={styles.formRow}>
            <label htmlFor="c-role">Peranan</label>
            <select
              id="c-role"
              className={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="PEGAWAI">Pegawai</option>
              <option value="WAKIL_ADUN">Wakil ADUN</option>
              <option value="ADMIN">Pentadbir</option>
              <option value="CITIZEN">Warganegara</option>
            </select>
          </div>
          {isAdunRole ? (
            <div className={styles.formRow}>
              <label htmlFor="c-adun">ADUN</label>
              <select
                id="c-adun"
                className={styles.input}
                value={adunId}
                onChange={(e) => setAdunId(e.target.value)}
                required
              >
                <option value="">Sila pilih ADUN</option>
                {availableAduns.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <p className={styles.helperNote}>
                Nama ADUN akan digunakan sebagai username log masuk. Hanya permohonan bagi ADUN ini akan
                dipaparkan kepada {role === "PEGAWAI" ? "pegawai" : "wakil ADUN"} ini.
              </p>
              {errors.adunId?.map((err) => (
                <p key={err} className={styles.fieldError}>
                  {err}
                </p>
              ))}
            </div>
          ) : (
            <div className={styles.formRow}>
              <label htmlFor="c-idnumber">{isCitizen ? "No. Kad Pengenalan" : "Username"}</label>
              <input
                type="text"
                id="c-idnumber"
                className={styles.input}
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                required
              />
              {!isCitizen && (
                <p className={styles.helperNote}>Digunakan untuk log masuk. Tidak semestinya No. Kad Pengenalan sebenar.</p>
              )}
              {errors.idNumber?.map((err) => (
                <p key={err} className={styles.fieldError}>
                  {err}
                </p>
              ))}
            </div>
          )}
          {isCitizen && (
            <div className={styles.formRow}>
              <label htmlFor="c-phone">No. Tel</label>
              <input
                type="text"
                id="c-phone"
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {errors.phone?.map((err) => (
                <p key={err} className={styles.fieldError}>
                  {err}
                </p>
              ))}
            </div>
          )}
          <div className={styles.formRow}>
            <label htmlFor="c-password">Kata Laluan</label>
            <PasswordInput id="c-password" className={styles.input} value={password} onChange={setPassword} required />
            {errors.password?.map((err) => (
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
              {loading ? "MENYIMPAN..." : "TAMBAH"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditUserModal({
  user,
  aduns,
  assignedAdunIdsByRole,
  isSelf,
  onClose,
  onDone,
}: {
  user: UserRow;
  aduns: AdunOption[];
  assignedAdunIdsByRole: Record<string, Set<string>>;
  isSelf: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [fullname, setFullname] = useState(user.fullname);
  const [phone, setPhone] = useState(user.phone);
  const [role, setRole] = useState<Role>(user.role);
  const [adunId, setAdunId] = useState(user.adunId ?? "");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<UpdateErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const assignedForRole = assignedAdunIdsByRole[role] ?? new Set<string>();
  const availableAduns = aduns.filter(
    (a) => !assignedForRole.has(a.id) || (a.id === user.adunId && role === user.role),
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setFormError(null);
    setLoading(true);

    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullname, phone, role, adunId, password }),
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

  const isAdunRole = ADUN_SCOPED_ROLES.includes(role);
  const isCitizen = role === "CITIZEN";

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalIconWrap}>
          <UserCog size={22} />
        </div>
        <h3 className={styles.modalTitle}>Kemaskini Pengguna</h3>
        <form onSubmit={handleSubmit}>
          {!isAdunRole && (
            <div className={styles.formRow}>
              <label htmlFor="e-idnumber">{isCitizen ? "No. Kad Pengenalan" : "Username"}</label>
              <input type="text" id="e-idnumber" className={styles.input} value={user.idNumber} disabled />
            </div>
          )}
          <div className={styles.formRow}>
            <label htmlFor="e-fullname">Nama Penuh</label>
            <input
              type="text"
              id="e-fullname"
              className={styles.input}
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              required
            />
            {errors.fullname?.map((err) => (
              <p key={err} className={styles.fieldError}>
                {err}
              </p>
            ))}
          </div>
          {isCitizen && (
            <div className={styles.formRow}>
              <label htmlFor="e-phone">No. Tel</label>
              <input
                type="text"
                id="e-phone"
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {errors.phone?.map((err) => (
                <p key={err} className={styles.fieldError}>
                  {err}
                </p>
              ))}
            </div>
          )}
          <div className={styles.formRow}>
            <label htmlFor="e-role">Peranan</label>
            <select
              id="e-role"
              className={styles.input}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              disabled={isSelf}
            >
              <option value="CITIZEN">Warganegara</option>
              <option value="PEGAWAI">Pegawai</option>
              <option value="WAKIL_ADUN">Wakil ADUN</option>
              <option value="ADMIN">Pentadbir</option>
            </select>
            {isSelf && <p className={styles.helperNote}>Anda tidak boleh menukar peranan akaun anda sendiri.</p>}
          </div>
          {isAdunRole && (
            <div className={styles.formRow}>
              <label htmlFor="e-adun">ADUN (Username)</label>
              <select
                id="e-adun"
                className={styles.input}
                value={adunId}
                onChange={(e) => setAdunId(e.target.value)}
                required
              >
                <option value="">Sila pilih ADUN</option>
                {availableAduns.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <p className={styles.helperNote}>
                Nama ADUN akan digunakan sebagai username log masuk. Hanya permohonan bagi ADUN ini akan
                dipaparkan kepada {role === "PEGAWAI" ? "pegawai" : "wakil ADUN"} ini.
              </p>
              {errors.adunId?.map((err) => (
                <p key={err} className={styles.fieldError}>
                  {err}
                </p>
              ))}
            </div>
          )}
          <div className={styles.formRow}>
            <label htmlFor="e-password">Kata Laluan Baharu</label>
            <PasswordInput id="e-password" className={styles.input} value={password} onChange={setPassword} />
            <p className={styles.helperNote}>Biarkan kosong jika tidak mahu menukar kata laluan.</p>
            {errors.password?.map((err) => (
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
              {loading ? "MENYIMPAN..." : "SIMPAN"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteUserModal({
  user,
  onClose,
  onDone,
}: {
  user: UserRow;
  onClose: () => void;
  onDone: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setFormError(null);
    setLoading(true);

    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setFormError(data?.error ?? "Gagal memadam pengguna.");
      return;
    }

    onDone();
    onClose();
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h3 className={styles.modalTitle}>Padam Pengguna</h3>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Tutup">
            <X size={16} />
          </button>
        </div>
        <p style={{ fontSize: 14, color: "#333", marginTop: -8 }}>
          Adakah anda pasti mahu memadam <strong>{user.fullname}</strong> ({user.idNumber})? Tindakan ini tidak
          boleh dibatalkan.
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

// PEGAWAI and WAKIL_ADUN accounts both derive their login username from the
// ADUN they're assigned to. A suffix keeps the two roles' usernames distinct
// so the same ADUN can have one of each without colliding on the unique
// idNumber column.
export function usernameForAdunRole(adunName: string, role: "PEGAWAI" | "WAKIL_ADUN") {
  return role === "WAKIL_ADUN" ? `${adunName} (Wakil)` : adunName;
}

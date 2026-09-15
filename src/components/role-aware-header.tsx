import { LegacyHeader } from "./legacy-header";
import { CitizenHeader } from "./citizen-header";
import { PegawaiHeader } from "./pegawai-header";
import { AdminHeader } from "./admin-header";
import { WakilAdunHeader } from "./wakil-adun-header";

// Public-facing pages (About, Contact, the general stats dashboard) are
// visited by both anonymous visitors and every logged-in role. This picks
// whichever header matches the current session instead of always showing
// the public nav to someone who's actually signed in.
export function RoleAwareHeader({ role }: { role?: string }) {
  if (role === "CITIZEN") return <CitizenHeader />;
  if (role === "PEGAWAI") return <PegawaiHeader />;
  if (role === "ADMIN") return <AdminHeader />;
  if (role === "WAKIL_ADUN") return <WakilAdunHeader />;
  return <LegacyHeader />;
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");
  if (session.user.role === "PEGAWAI") redirect("/pegawai");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Selamat Datang, {session.user.name}
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Ini adalah papan utama pemohon — permohonan bantuan dan semakan status akan dibina di sini.
      </p>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Papan Utama Admin
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Selamat datang, {session.user.name}. Pengurusan pengguna dan laporan akan dipaparkan di sini.
      </p>
    </div>
  );
}

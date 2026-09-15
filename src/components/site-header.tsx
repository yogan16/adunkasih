import Link from "next/link";
import { auth } from "@/auth";
import { logoutAction } from "@/lib/actions/auth";
import { MobileNav } from "./mobile-nav";

const NAV_LINKS = [
  { href: "/", label: "Utama" },
  { href: "/about", label: "Tentang Kami" },
  { href: "/announcements", label: "Maklumat Agihan" },
  { href: "/contact", label: "Hubungi Kami" },
];

function dashboardHrefFor(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "PEGAWAI") return "/pegawai";
  return "/dashboard";
}

export async function SiteHeader() {
  const session = await auth();
  const dashboardHref = dashboardHrefFor(session?.user.role);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:bg-slate-950/90">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-slate-900 dark:text-white">
          <span className="text-primary">ADUN</span>KASIH
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-primary dark:text-slate-300"
            >
              {link.label}
            </Link>
          ))}

          {session ? (
            <>
              <Link
                href={dashboardHref}
                className="text-sm font-medium text-slate-600 transition hover:text-primary dark:text-slate-300"
              >
                Papan Utama
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900"
                >
                  Log Keluar
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Log Masuk
            </Link>
          )}
        </nav>

        <MobileNav navLinks={NAV_LINKS} isLoggedIn={!!session} dashboardHref={dashboardHref} />
      </div>
    </header>
  );
}

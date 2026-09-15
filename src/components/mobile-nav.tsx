"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

type NavLink = { href: string; label: string };

export function MobileNav({
  navLinks,
  isLoggedIn,
  dashboardHref,
}: {
  navLinks: NavLink[];
  isLoggedIn: boolean;
  dashboardHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Togol menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-40 border-b border-slate-200 bg-white px-4 pb-4 shadow-lg dark:border-slate-800 dark:bg-slate-950">
          <nav className="flex flex-col gap-1 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {link.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                <Link
                  href={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Papan Utama
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="mt-1 w-full rounded-lg bg-slate-900 px-3 py-2.5 text-left text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
                  >
                    Log Keluar
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-semibold text-white"
              >
                Log Masuk
              </Link>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}

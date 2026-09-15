"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import styles from "./general-dashboard.module.css";

export function YearFilter({ years }: { years: number[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("year") ?? "ALL";

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL") {
      params.delete("year");
    } else {
      params.set("year", value);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className={styles.yearFilterRow}>
      <label htmlFor="year-filter" className={styles.yearFilterLabel}>
        Tahun
      </label>
      <select
        id="year-filter"
        className={styles.statusFilterSelect}
        value={current}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="ALL">Semua Tahun</option>
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

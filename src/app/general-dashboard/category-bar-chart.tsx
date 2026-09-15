"use client";

import { useState } from "react";
import { ChartTooltip } from "./chart-tooltip";
import styles from "./general-dashboard.module.css";

type Datum = { name: string; count: number };

export function CategoryBarChart({ data }: { data: Datum[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; count: number } | null>(null);

  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className={`${styles.vizRoot} ${styles.barChart}`}>
      {data.map((d) => {
        const pct = (d.count / max) * 100;
        const labelFitsInside = pct > 22;
        return (
          <div key={d.name} className={styles.barRow}>
            <span className={styles.barRowLabel} title={d.name}>
              {d.name}
            </span>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${pct}%` }}
                onPointerMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, name: d.name, count: d.count })}
                onPointerLeave={() => setTooltip(null)}
                tabIndex={0}
                onFocus={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({ x: rect.right, y: rect.top, name: d.name, count: d.count });
                }}
                onBlur={() => setTooltip(null)}
              >
                {labelFitsInside && <span className={styles.barValueInside}>{d.count}</span>}
              </div>
            </div>
            {!labelFitsInside && <span className={styles.barValueOutside}>{d.count}</span>}
          </div>
        );
      })}

      {tooltip && <ChartTooltip x={tooltip.x} y={tooltip.y} label={tooltip.name} value={tooltip.count} />}
    </div>
  );
}

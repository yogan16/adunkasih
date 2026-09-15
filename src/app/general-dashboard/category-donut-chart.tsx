"use client";

import { useState } from "react";
import { ChartTooltip } from "./chart-tooltip";
import styles from "./general-dashboard.module.css";

const COLOR_VARS = ["--series-1", "--series-2", "--series-3", "--series-4", "--series-5"] as const;

type Datum = { name: string; count: number };

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 78;
const STROKE = 32;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function CategoryDonutChart({ data }: { data: Datum[] }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; name: string; count: number } | null>(null);

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const segments = data.map((d, i) => ({ ...d, colorVar: COLOR_VARS[i % COLOR_VARS.length] }));

  if (total === 0) {
    return <p className={styles.emptyState}>Tiada permohonan buat masa ini.</p>;
  }

  let cumulative = 0;

  return (
    <div className={`${styles.vizRoot} ${styles.donutWrap}`}>
      <div className={styles.donutSvgBox}>
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
          <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
            {segments
              .filter((s) => s.count > 0)
              .map((s) => {
                const dash = (s.count / total) * CIRCUMFERENCE;
                const offset = CIRCUMFERENCE - cumulative;
                cumulative += dash;
                return (
                  <circle
                    key={s.name}
                    cx={CENTER}
                    cy={CENTER}
                    r={RADIUS}
                    fill="none"
                    stroke={`var(${s.colorVar})`}
                    strokeWidth={STROKE}
                    strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                    strokeDashoffset={offset}
                    className={styles.donutSegment}
                    onPointerMove={(e) => setTooltip({ x: e.clientX, y: e.clientY, name: s.name, count: s.count })}
                    onPointerLeave={() => setTooltip(null)}
                    tabIndex={0}
                    onFocus={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltip({ x: rect.left + rect.width / 2, y: rect.top, name: s.name, count: s.count });
                    }}
                    onBlur={() => setTooltip(null)}
                  />
                );
              })}
          </g>
        </svg>
        <div className={styles.donutCenter}>
          <span className={styles.donutCenterValue}>{total}</span>
          <span className={styles.donutCenterLabel}>Jumlah</span>
        </div>
      </div>

      <div className={styles.legend}>
        {segments.map((s) => (
          <div key={s.name} className={styles.legendItem}>
            <span className={styles.legendSwatch} style={{ background: `var(${s.colorVar})` }} />
            {s.name} &middot; <span className={styles.legendValue}>{s.count}</span>
          </div>
        ))}
      </div>

      {tooltip && <ChartTooltip x={tooltip.x} y={tooltip.y} label={tooltip.name} value={tooltip.count} />}
    </div>
  );
}

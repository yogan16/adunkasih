"use client";

import { createPortal } from "react-dom";
import styles from "./general-dashboard.module.css";

export function ChartTooltip({ x, y, label, value }: { x: number; y: number; label: string; value: number }) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className={styles.tooltip} style={{ left: x, top: y }}>
      {label}: <span className={styles.tooltipValue}>{value}</span>
    </div>,
    document.body,
  );
}

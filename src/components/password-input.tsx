"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import styles from "./password-input.module.css";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange" | "className">;

export function PasswordInput({ value, onChange, className, ...inputProps }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.wrapper}>
      <input
        {...inputProps}
        type={visible ? "text" : "password"}
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ paddingRight: 42 }}
      />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Sembunyikan kata laluan" : "Tunjukkan kata laluan"}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        <span className={styles.tooltip}>{visible ? "Sembunyi" : "Tunjuk"}</span>
      </button>
    </div>
  );
}

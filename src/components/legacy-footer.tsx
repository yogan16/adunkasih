import styles from "./legacy-footer.module.css";

type Variant = "fixed-black" | "fixed-translucent" | "static-black";

const variantClass: Record<Variant, string> = {
  "fixed-black": styles.fixedBlack,
  "fixed-translucent": styles.fixedTranslucent,
  "static-black": styles.staticBlack,
};

export function LegacyFooter({ variant = "fixed-black" }: { variant?: Variant }) {
  return (
    <footer className={`${styles.footer} ${variantClass[variant]}`}>
      Hal Cipta Terpelihara 2024 @ Kerajaan Negeri Kedah
    </footer>
  );
}

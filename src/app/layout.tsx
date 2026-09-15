import type { Metadata } from "next";
import { Fredoka, Pacifico } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const pacifico = Pacifico({
  variable: "--font-pacifico",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "ADUNKASIH @ Kedah",
  description: "Portal rasmi sistem kebajikan ADUNKASIH, Kerajaan Negeri Kedah",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ms" className={`${fredoka.variable} ${pacifico.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

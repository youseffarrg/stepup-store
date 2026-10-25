
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "STEPUP | Move With Confidence",
  description: "اكتشف أحدث الأحذية من STEPUP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}


import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "STEPUP | أحذية رجالي وحريمي وأطفال", template: "%s | STEPUP" },
  description: "اكتشف موديلات STEPUP للأحذية الرجالي والحريمي والأطفال. تصفح المنتجات وتواصل معنا لتأكيد المقاس والتوصيل.",
  metadataBase: new URL("https://stepup-store-gray.vercel.app"),
  openGraph: { title: "STEPUP | Move With Confidence", description: "اكتشف موديلات STEPUP للأحذية.", url: "https://stepup-store-gray.vercel.app", siteName: "STEPUP", locale: "ar_EG", type: "website" },
  robots: { index: true, follow: true },
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

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "화물 요금 계산기",
  description: "수식 기반 화물 요금 계산 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}


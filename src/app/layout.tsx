import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { DarkModeProvider } from "@/contexts/DarkModeContext";

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
    <html lang="ko" suppressHydrationWarning>
      <body>
        {/* 구글 애드센스 스크립트 - Next.js Script 컴포넌트가 자동으로 head에 추가 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5216568727644747"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </body>
    </html>
  );
}


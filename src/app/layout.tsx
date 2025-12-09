import type { Metadata } from "next";
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
        <DarkModeProvider>
          {children}
        </DarkModeProvider>
      </body>
    </html>
  );
}


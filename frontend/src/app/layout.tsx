import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";
import { AdminFab } from "@/components/common/admin-fab";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "IANN",
    template: "%s | IANN",
  },
  description: "웹 개발을 학습하며 배운 것들을 기록하고 공유하는 블로그",
};

// viewport 미설정 시 iOS Safari가 페이지를 데스크탑 너비(980px)로 렌더링하여 터치 좌표 어긋남 방지
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="alternate" type="application/rss+xml" title="Min's Dev Blog RSS" href="/feed.xml" />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <MobileHeader />
              <main className="flex-1 p-6 md:p-8">{children}</main>
              <AdminFab />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

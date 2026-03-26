"use client";

import { usePathname } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Components
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <html lang="pt-BR" className="h-full bg-slate-50">
        <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
          {children}
        </body>
      </html>
    );
  }

  return (
    <html lang="pt-BR" className="h-full bg-background">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <Sidebar />
        <div className="lg:pl-64 h-full flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 lg:p-8 h-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

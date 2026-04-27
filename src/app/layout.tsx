import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import AppShell from "@/components/shell/app-shell";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Cart",
  description: "ERP demo for The Cartel Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark font-sans", inter.variable)}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

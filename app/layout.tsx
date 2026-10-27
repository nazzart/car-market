import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppThemeProvider from "@/components/providers/ThemeProvider";
import "./globals.css";
import Container from "@/components/layout/Container";
import { colors } from "@/lib/colors";
import Header from "@/components/layout/header/Header";
import Footer from "@/components/layout/footer/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "bestauto.lv — покупка и продажа автомобилей",
  description: "Объявления о продаже новых и подержанных автомобилей в Латвии",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" style={{
      ["--color-primary" as any]: colors.primary,
      ["--color-primary-hover" as any]: colors.primaryHover,
    }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppThemeProvider>
          <Container>
            <Header />
          </Container>
          {children}
          <Footer />
        </AppThemeProvider>
      </body>
    </html>
  );
}

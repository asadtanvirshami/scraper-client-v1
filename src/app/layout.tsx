import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/hooks/language/use-language";
import Providers from "@/providers/react-query";
import StoreProvider from "@/redux/store-provider";
import "react-quill-new/dist/quill.snow.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DataHarvX",
  description:
    "Welcome to DataHarvX. Get qualified leads and grow your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased `}
      >
        <LanguageProvider>
          <Providers>
            <StoreProvider>
              <AntdRegistry>{children}</AntdRegistry>
            </StoreProvider>
          </Providers>
        </LanguageProvider>
      </body>
    </html>
  );
}

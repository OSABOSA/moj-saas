import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs"; // 1. Importujemy dostawcę

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mój SaaS",
  description: "Generator QR",
};

export default function RootLayout({ children }) {
  return (
    // 2. Owijamy całe HTML w ClerkProvider
    <ClerkProvider>
      <html lang="pl">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
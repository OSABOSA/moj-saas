import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mój SaaS",
  description: "Generator QR",
};

// Tutaj była zmiana: dodaliśmy ": { children: React.ReactNode }"
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pl">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
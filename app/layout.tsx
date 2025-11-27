import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider"; // <--- Importujemy nasz plik

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ClickBot SaaS",
  description: "Automate your Discord",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          
          {/* TO JEST KLUCZOWE: Owijamy aplikację w ThemeProvider */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          
        </body>
      </html>
    </ClerkProvider>
  );
}
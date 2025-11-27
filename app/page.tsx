"use client";

// Importujemy komponenty, które przed chwilą skopiowałeś
import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { DemoSection } from "@/components/demo-section";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* UWAGA: Navbar w starym projekcie może mieć linki z "wouter" (<Link href="...">).
         Będziesz musiał wejść w plik components/navbar.tsx 
         i zamienić import { Link } from "wouter" na import Link from "next/link".
      */}
      <Navbar />
      
      <main>
        <HeroSection />
        <FeaturesSection />
        <DemoSection />
        {/* Tu będzie nasza logika płatności, ale na razie wyświetlmy wygląd */}
        <PricingSection /> 
      </main>

      <Footer />
    </div>
  );
}
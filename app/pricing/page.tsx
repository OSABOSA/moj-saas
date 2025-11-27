"use client";
import { Navbar } from "@/components/navbar";
import { PricingSection } from "@/components/pricing-section";
import { Footer } from "@/components/footer";

export default function Pricing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Start with our free plan and upgrade as you grow
          </p>
        </div>
      </div>
      <PricingSection />
      <Footer />
    </div>
  );
}

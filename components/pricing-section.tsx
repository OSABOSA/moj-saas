"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingCard } from "./pricing-card"; // <--- Importujemy Twój komponent
import { SiVisa, SiMastercard } from "react-icons/si";

export function PricingSection() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Nasza funkcja płatności ze Stripe
  const handleCheckout = async (priceId: string) => {
    try {
      setLoadingId(priceId);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("Błąd:", error);
      alert("Wystąpił błąd płatności.");
      setLoadingId(null);
    }
  };

  // Konfiguracja planów
  const plans = [
    {
      name: "Free",
      price: "0 zł",
      period: "forever",
      features: [
        "1 Discord server",
        "Basic auto-clicking",
        "1,000 clicks/month",
        "Community support",
      ],
      buttonText: "Get Started",
      highlighted: false,
      // Akcja dla FREE: idź do dashboardu
      action: () => router.push("/dashboard"),
    },
    {
      name: "Pro",
      price: "20 zł", // Cena zgodna z Twoim Stripe
      period: "one-time",
      features: [
        "5 Discord servers",
        "Advanced auto-clicking",
        "Unlimited clicks",
        "Custom intervals",
        "Analytics dashboard",
        "Priority support",
      ],
      highlighted: true,
      buttonText: "Buy Pro Access",
      priceId: process.env.NEXT_PUBLIC_PRICE_MUSIC, // <--- Tu wstaw ID ze Stripe (Music lub inny)
      // Akcja dla PRO: uruchom Stripe
      action: (priceId: string) => handleCheckout(priceId),
    },
    {
      name: "Enterprise",
      price: "199 zł",
      period: "/month",
      features: [
        "Unlimited servers",
        "White-label option",
        "Custom features",
        "API access",
        "Advanced analytics",
        "Dedicated support",
        "SLA guarantee",
      ],
      buttonText: "Contact Sales",
      highlighted: false,
      // Akcja dla Enterprise: mail
      action: () => window.location.href = "mailto:sales@twojafirma.pl",
    },
  ];

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your needs
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              highlighted={plan.highlighted}
              // Jeśli ten plan się ładuje, zmień tekst przycisku
              buttonText={loadingId === plan.priceId && plan.priceId ? "Przetwarzanie..." : plan.buttonText}
              // Wykonaj odpowiednią akcję
              onButtonClick={() => {
                if (plan.priceId) {
                   // Jeśli to plan płatny (ma priceId)
                   plan.action(plan.priceId);
                } else {
                   // Jeśli to plan darmowy/enterprise (nie ma priceId)
                   // @ts-ignore - ignorujemy typowanie dla uproszczenia w tym miejscu
                   plan.action();
                }
              }}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            All prices in PLN • Polish payment methods supported
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SiVisa className="h-8 w-auto" />
              <SiMastercard className="h-8 w-auto" />
              <span>Credit & Debit Cards</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            * Recurring subscriptions require card payment. Przelewy24 & BLIK available for one-time purchases.
          </p>
        </div>
      </div>
    </section>
  );
}
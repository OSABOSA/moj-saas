"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PricingCard } from "./pricing-card";
import { SiVisa, SiMastercard } from "react-icons/si";

export function PricingSection() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Funkcja płatności ze Stripe
  const handleCheckout = async (priceId: string, mode: "payment" | "subscription") => {
    try {
      setLoadingId(priceId);
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId, mode }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (error) {
      console.error("Błąd:", error);
      alert("Wystąpił błąd płatności.");
      setLoadingId(null);
    }
  };

  // Konfiguracja 4 planów zgodnie z Twoim Stripe
  const plans = [
    {
      name: "Music BOT",
      price: "5 zł",
      period: "/mies.",
      features: [
        "Wysoka jakość dźwięku",
        "Brak reklam",
        "Nielimitowane playlisty",
        "Wsparcie 24/7",
      ],
      buttonText: "Wybierz Music",
      highlighted: false,
      priceId: process.env.NEXT_PUBLIC_PRICE_MUSIC, 
      mode: "subscription" as "subscription",
    },
    {
      name: "Server Manager",
      price: "10 zł",
      period: "/mies.",
      features: [
        "Auto-moderacja",
        "Logi serwera",
        "System ticketów",
        "Role reaction",
      ],
      buttonText: "Wybierz Manager",
      highlighted: false,
      priceId: process.env.NEXT_PUBLIC_PRICE_SERVER,
      mode: "subscription" as "subscription",
    },
    {
      name: "Watch Together",
      price: "15 zł",
      period: "/mies.",
      features: [
        "Oglądanie YouTube/Twitch",
        "Synchronizacja video",
        "Jakość HD",
        "Dedykowany panel",
      ],
      buttonText: "Wybierz Watch",
      highlighted: true, // Możesz wyróżnić ten lub inny
      priceId: process.env.NEXT_PUBLIC_PRICE_WATCH,
      mode: "subscription" as "subscription",
    },
    {
      name: "Wersja PRO",
      price: "20 zł",
      period: "jednorazowo", // Zgodnie z poprzednim kodem, lub /mies. jeśli to subskrypcja
      features: [
        "Dostęp do wszystkich botów",
        "Priorytetowe wsparcie",
        "Badge PRO na profilu",
        "Wczesny dostęp do nowości",
      ],
      buttonText: "Kup PRO",
      highlighted: false,
      priceId: process.env.NEXT_PUBLIC_PRICE_PRO,
      mode: "payment" as "payment",
    },
  ];

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Wybierz swój plan
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Elastyczne plany dostosowane do Twoich potrzeb
          </p>
        </div>

        {/* Zmieniony GRID: na dużych ekranach (xl) są 4 kolumny, na średnich (md) 2 kolumny */}
        <div className="mt-16 grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <PricingCard
              key={plan.name}
              name={plan.name}
              price={plan.price}
              period={plan.period}
              features={plan.features}
              highlighted={plan.highlighted}
              // Obsługa stanu ładowania przycisku
              buttonText={loadingId === plan.priceId ? "Przetwarzanie..." : plan.buttonText}
              // Wykonaj akcję płatności
              onButtonClick={() => {
                if (plan.priceId) {
                  handleCheckout(plan.priceId, plan.mode);
                } else {
                  console.error("Brak Price ID dla:", plan.name);
                  alert("Konfiguracja płatności nie jest gotowa.");
                }
              }}
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            Wszystkie ceny w PLN • Obsługujemy polskie metody płatności
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SiVisa className="h-8 w-auto" />
              <SiMastercard className="h-8 w-auto" />
              <span>Karty, BLIK, Przelewy24</span>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            * Subskrypcje wymagają podpięcia karty. Płatności jednorazowe dostępne przez BLIK/P24.
          </p>
        </div>
      </div>
    </section>
  );
}
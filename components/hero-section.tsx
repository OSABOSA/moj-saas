"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bot, ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28 bg-background">
      <div className="container mx-auto px-4 text-center">
        
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground mb-8 bg-secondary/50 backdrop-blur-sm">
          <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
          Nowość: Bot Server Manager v2.0
        </div>

        <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          Supermoce dla Twojego <br />
          serwera Discord
        </h1>
        
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground mb-10">
          Przestań męczyć się z konfiguracją dziesiątek botów. 
          BetterBots to zestaw profesjonalnych narzędzi: Muzyka Hi-Fi, Wspólne Oglądanie i Automatyczna Moderacja.
          Wszystko w jednym panelu.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button size="lg" className="h-12 px-8 text-lg gap-2" asChild>
            <Link href="https://discord.com/oauth2/authorize?client_id=1440040082269667519" target="_blank">
              Dodaj Bota <Bot size={18} />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-lg gap-2" asChild>
            <Link href="/pricing">
              Zobacz Ceny <ArrowRight size={18} />
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="h-12 px-8 text-lg gap-2" asChild>
            <Link href="/dashboard">
              Panel Sterowania
            </Link>
          </Button>
        </div>

        {/* Opcjonalnie: Obrazek pod spodem */}
        <div className="mt-20 relative mx-auto max-w-5xl rounded-xl border bg-card/50 p-2 shadow-2xl backdrop-blur-sm">
           <div className="aspect-video rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center text-slate-600">
              {/* Tu możesz wstawić <img> ze screenem swojego bota */}
              <p>Miejsce na screenshot interfejsu bota</p>
           </div>
        </div>

      </div>
    </section>
  );
}
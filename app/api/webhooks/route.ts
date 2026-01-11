import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20", 
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// --- KONFIGURACJA MAPOWANIA Z TWOICH ZMIENNYCH ---
// Używamy zmiennych środowiskowych, które podałeś
// Wykrzyknik (!) na końcu mówi TypeScriptowi: "Spokojnie, ta zmienna na pewno istnieje"
const PRICE_MAP: Record<string, string> = {
  [process.env.NEXT_PUBLIC_PRICE_MUSIC!]: "FREE",        // Music BOT
  [process.env.NEXT_PUBLIC_PRICE_SERVER!]: "PRO",       // Server Manager
  [process.env.NEXT_PUBLIC_PRICE_PRO!]: "ENTERPRISE",   // Wersja PRO
  
  // Jeśli chcesz obsłużyć też WATCH, odkomentuj i przypisz typ:
  // [process.env.NEXT_PUBLIC_PRICE_WATCH!]: "JAKIS_TYP",
};

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not set!");
    return new NextResponse("Server Config Error", { status: 500 });
  }

  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
  
  console.log("Received Stripe event:", event.type);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // 1. Pobieramy userId z metadata (wysłane z api/checkout/route.ts)
      const userId = session.metadata?.userId || session.client_reference_id;

      if (!userId) {
        console.error("User ID not found in session metadata.");
        return new NextResponse("Missing User ID", { status: 200 }); 
      }

      // 2. Pobieramy zakupione produkty
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;

      if (!priceId) {
        console.error("Price ID not found.");
        return new NextResponse("Missing Price ID", { status: 200 });
      }

      // 3. Mapujemy cenę na typ subskrypcji
      // Teraz szuka klucza odpowiadającego wartości zmiennej środowiskowej
      const planType = PRICE_MAP[priceId];

      if (!planType) {
        console.error(`Nieznany priceId: ${priceId}. Sprawdź zmienne env.`);
        // To ważne logowanie - jeśli tutaj wpadnie, znaczy że ID w Stripe nie pasuje do tego w Vercel
        console.log("Dostępne mapowanie:", PRICE_MAP); 
        return new NextResponse("Unknown Price ID", { status: 200 });
      }

      // 4. Obliczamy daty (+1 miesiąc)
      const now = new Date();
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(now.getMonth() + 1);

      console.log(`Aktualizacja usera ${userId} na plan ${planType} (do ${oneMonthLater.toISOString()})`);

      // 5. Aktualizujemy Supabase
      const { error } = await supabase
        .from("subscriptions")
        .update({
          is_subscribed: true,
          subscribe_type: planType,
          subscribe_start_time: now.toISOString(),
          subscribe_end_time: oneMonthLater.toISOString(),
        })
        .eq("user_id", userId);

      if (error) {
        console.error("Supabase update error:", error);
        return new NextResponse("Database Error", { status: 500 });
      } else {
        console.log("Supabase updated successfully!");
      }

      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse("OK", { status: 200 });
}
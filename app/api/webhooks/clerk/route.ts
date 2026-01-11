import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// 1. Inicjalizacja Stripe z obejściem błędu wersji (as any)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any, 
});

// 2. Inicjalizacja Supabase (Admin - Service Role)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 3. Mapowanie Twoich zmiennych ENV na typy w bazie
const PRICE_MAP: Record<string, string> = {
  [process.env.NEXT_PUBLIC_PRICE_MUSIC!]: "FREE",        // Music BOT
  [process.env.NEXT_PUBLIC_PRICE_SERVER!]: "PRO",       // Server Manager
  [process.env.NEXT_PUBLIC_PRICE_PRO!]: "ENTERPRISE",   // Wersja PRO
  
  // Opcjonalnie dodaj WATCH jeśli ma zmieniać typ:
  // [process.env.NEXT_PUBLIC_PRICE_WATCH!]: "PRO",
};

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("BRAK ZMIENNEJ: STRIPE_WEBHOOK_SECRET");
    return new NextResponse("Server Config Error", { status: 500 });
  }

  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  // 4. Weryfikacja podpisu (Security)
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error: any) {
    console.error("Błąd weryfikacji podpisu Stripe:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
  
  console.log("Otrzymano zdarzenie Stripe:", event.type);

  // Funkcja pomocnicza do aktualizacji bazy
  const updateUserSubscription = async (userId: string, type: string, endDate: Date) => {
    const { error } = await supabase.from("subscriptions").update({
      is_subscribed: true,
      subscribe_type: type,
      subscribe_start_time: new Date().toISOString(),
      subscribe_end_time: endDate.toISOString(),
    }).eq("user_id", userId);

    if (error) console.error("Błąd Supabase:", error);
    else console.log(`SUKCES: Zaktualizowano usera ${userId} na plan ${type}`);
  };

  switch (event.type) {
    // --- SCENARIUSZ A: Pierwsza płatność (sukces sesji checkout) ---
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Pobieramy ID usera z metadata (to wysłaliśmy z api/checkout)
      const userId = session.metadata?.userId || session.client_reference_id;

      if (!userId) {
        console.error("Brak User ID w sesji.");
        return new NextResponse("Missing User ID", { status: 200 });
      }

      // Pobieramy co kupił
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;
      
      // Mapujemy cenę na typ (FREE/PRO/ENTERPRISE)
      // Jeśli cena nie pasuje do mapy, ustawiamy domyślnie 'FREE' lub logujemy błąd
      const planType = PRICE_MAP[priceId!] || 'FREE';

      // Ustawiamy czas trwania: Teraz + 1 Miesiąc
      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      await updateUserSubscription(userId, planType, oneMonthLater);
      break;
    }

    // --- SCENARIUSZ B: Odnowienie subskrypcji (płatność cykliczna) ---
    // (Zadziała tylko jeśli włączysz mode: 'subscription')
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      
      // Jeśli to płatność za subskrypcję
      if (invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const userId = subscription.metadata?.userId; // Tu userId musi być w metadata subskrypcji
        const priceId = invoice.lines.data[0]?.price?.id;
        const planType = PRICE_MAP[priceId!] || 'FREE';

        // Data końca brana bezpośrednio ze Stripe
        const periodEnd = new Date(subscription.current_period_end * 1000);

        if (userId) {
          await updateUserSubscription(userId, planType, periodEnd);
        }
      }
      break;
    }

    // --- SCENARIUSZ C: Anulowanie subskrypcji ---
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;

      if (userId) {
        console.log(`Subskrypcja anulowana dla user: ${userId}`);
        await supabase.from("subscriptions").update({
          is_subscribed: false,
          subscribe_type: 'FREE', // Powrót do planu darmowego
          subscribe_end_time: new Date().toISOString() // Koniec teraz
        }).eq("user_id", userId);
      }
      break;
    }
  }

  return new NextResponse("OK", { status: 200 });
}
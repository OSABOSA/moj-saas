import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// 1. Inicjalizacja Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any, 
});

// 2. Inicjalizacja Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 3. Mapowanie Cen
const PRICE_MAP: Record<string, string> = {
  [process.env.NEXT_PUBLIC_PRICE_MUSIC!]: "FREE",
  [process.env.NEXT_PUBLIC_PRICE_SERVER!]: "PRO",
  [process.env.NEXT_PUBLIC_PRICE_PRO!]: "ENTERPRICE",
};

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("BRAK ZMIENNEJ: STRIPE_WEBHOOK_SECRET");
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
    console.error("Błąd weryfikacji podpisu Stripe:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
  
  console.log("Otrzymano zdarzenie Stripe:", event.type);

  // --- FUNKCJA POMOCNICZA: TŁUMACZ ID ---
  // To naprawia błąd "invalid input syntax for type uuid"
  const getSupabaseUserId = async (rawId: string): Promise<string | null> => {
    // Jeśli ID to już UUID (np. z metadata), zwracamy je
    if (rawId.includes("-") && !rawId.startsWith("user_")) {
        return rawId;
    }

    // Jeśli to Clerk ID (zaczyna się od user_), szukamy UUID w bazie
    console.log(`Szukam UUID dla Clerk ID: ${rawId}`);
    const { data } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', rawId)
        .single();
    
    return data ? data.id : null;
  };

  // --- FUNKCJA AKTUALIZACJI ---
  const updateUserSubscription = async (rawUserId: string, type: string, endDate: Date) => {
    // 1. Najpierw tłumaczmy ID na UUID
    const targetUuid = await getSupabaseUserId(rawUserId);

    if (!targetUuid) {
        console.error(`BŁĄD: Nie znaleziono usera w bazie dla ID: ${rawUserId}`);
        return;
    }

    // 2. Aktualizujemy po UUID
    const { error } = await supabase.from("subscriptions").update({
      is_subscribed: true,
      subscribe_type: type,
      subscribe_start_time: new Date().toISOString(),
      subscribe_end_time: endDate.toISOString(),
    }).eq("user_id", targetUuid); // Teraz targetUuid to na pewno UUID

    if (error) console.error("Błąd Supabase Update:", error);
    else console.log(`SUKCES: Zaktualizowano usera (UUID: ${targetUuid}) na plan ${type}`);
  };

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Pobieramy ID (może być Clerk ID lub UUID, nasz Tłumacz to ogarnie)
      const rawUserId = session.metadata?.userId || session.client_reference_id;

      if (!rawUserId) {
        return new NextResponse("Missing User ID", { status: 200 });
      }

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const priceId = lineItems.data[0]?.price?.id;
      const planType = PRICE_MAP[priceId!] || 'FREE';

      const oneMonthLater = new Date();
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

      await updateUserSubscription(rawUserId, planType, oneMonthLater);
      break;
    }

    case 'invoice.payment_succeeded': {
        // ... (logika dla subskrypcji cyklicznych - opcjonalna)
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
            const rawUserId = subscription.metadata?.userId;
            const priceId = invoice.lines.data[0]?.price?.id;
            const planType = PRICE_MAP[priceId!] || 'FREE';
            const periodEnd = new Date(subscription.current_period_end * 1000);

            if (rawUserId) {
                await updateUserSubscription(rawUserId, planType, periodEnd);
            }
        }
        break;
    }
  }

  return new NextResponse("OK", { status: 200 });
}
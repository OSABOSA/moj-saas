import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  console.log("1. Webhook odebrany!");

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("BRAK KLUCZY W ENV!");
    return new NextResponse("Server Config Error", { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-10-16" as any,
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.text();
  
  // --- TU BYŁ BŁĄD ---
  // Musimy dodać 'await' przed headers()
  const headersList = await headers();
  const signature = headersList.get("Stripe-Signature") as string;
  // -------------------

  let event: Stripe.Event;

  try {
    console.log("2. Weryfikacja podpisu...");
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("3. Podpis OK. Typ zdarzenia:", event.type);
  } catch (error: any) {
    console.error("Błąd weryfikacji:", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const userId = session.metadata?.userId;

    console.log("4. Przetwarzanie sesji dla UserID:", userId);

    if (userId) {
      // Używamy UPSERT: Wstaw, a jak istnieje to zaktualizuj
      const { error, data } = await supabase
        .from("profiles")
        .upsert({ 
          user_id: userId, 
          is_pro: true 
        })
        .select(); // To ważne, żeby zobaczyć czy coś zwrócił
      
      console.log("Wynik operacji bazy:", data);

      if (error) {
        console.error("5. Błąd bazy danych:", error);
      } else {
        console.log("6. SUKCES! User jest teraz PRO.");
      }
    }
  }

  return new NextResponse("OK", { status: 200 });
}
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js"; // 1. Dodajemy klienta bazy

// Inicjalizacja Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

// 2. Inicjalizacja Supabase "na szybko" wewnątrz API
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Musisz być zalogowany", { status: 401 });
    }

    // --- NOWOŚĆ: NAPRAWA PUSTEJ TABELI PROFILES ---
    
    // A. Sprawdzamy czy user już jest w tabeli profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // B. Jeśli go nie ma, tworzymy go TERAZ
    if (!profile) {
      console.log("Tworzę nowy profil dla:", user.id);
      const { error } = await supabase
        .from('profiles')
        .insert([
          { 
            user_id: user.id, 
            is_pro: false,
            email: user.emailAddresses[0]?.emailAddress // Opcjonalnie zapisz email
          }
        ]);
      
      if (error) {
        console.error("Błąd tworzenia profilu:", error);
        // Nie przerywamy, bo chcemy pozwolić mu zapłacić, ale warto wiedzieć
      }
    }
    // ---------------------------------------------

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://' + process.env.VERCEL_URL}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://' + process.env.VERCEL_URL}?canceled=1`,
      metadata: {
        userId: user.id,
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
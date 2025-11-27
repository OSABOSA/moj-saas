import { NextResponse } from "next/server";
import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    // 1. Odbieramy informację, CO user chce kupić
    const { priceId } = await req.json();

    if (!priceId) return new NextResponse("Price ID required", { status: 400 });

    // (Opcjonalnie: tu można sprawdzić czy user już tego nie ma w bazie)

    // Upewniamy się, że user istnieje w profiles (Autozapis)
    const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
    if (!profile) {
      await supabase.from('profiles').insert([{ user_id: user.id, is_pro: false }]);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId, // <--- Używamy ID przesłanego z frontendu
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}?canceled=1`,
      metadata: {
        userId: user.id,
        // Możemy tu dodać info, co to za produkt, żeby webhook wiedział co odblokować
        // Ale Stripe sam nam powie, jaki PriceID został kupiony
      },
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs/server";

// Inicjalizacja Stripe przy użyciu Tajnego Klucza
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia", // (VS Code może podpowiedzieć nowszą, to ok)
});

export async function POST() {
  try {
    // 1. Sprawdzamy, kto kupuje (pobieramy usera z Clerka)
    const user = await currentUser();
    
    if (!user) {
      return new NextResponse("Musisz być zalogowany", { status: 401 });
    }

    // 2. Tworzymy sesję płatności w Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "blik"], // Możesz dodać BLIK jeśli chcesz
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID, // Tu wchodzi Twoje ID ceny
          quantity: 1,
        },
      ],
      mode: "payment", // Płatność jednorazowa
      
      // Gdzie odesłać klienta po sukcesie lub anulowaniu?
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}?canceled=1`,
      
      // WAŻNE: Tutaj przyklejamy ID użytkownika do transakcji. 
      // Dzięki temu potem (w Webhooku) będziemy wiedzieć, KOMU włączyć wersję PRO.
      metadata: {
        userId: user.id,
      },
    });

    // 3. Zwracamy link do płatności frontendowi
    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("[STRIPE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
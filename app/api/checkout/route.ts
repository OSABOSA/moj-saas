import { NextResponse } from "next/server";
import Stripe from "stripe";
import { currentUser } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { priceId, mode } = await req.json();
    if (!priceId) return new NextResponse("Price ID required", { status: 400 });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: mode || "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `http://localhost:3000/dashboard?success=true`,
      cancel_url: `http://localhost:3000/pricing?canceled=true`,
      client_reference_id: user.id,
      expand: ["line_items"],
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
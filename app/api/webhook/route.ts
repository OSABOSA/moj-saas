import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function upsertSubscription(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string);
  const userId = (customer as any).metadata.userId || subscription.metadata.userId;

  const { error } = await supabase
    .from("subscriptions")
    .upsert({
      stripe_subscription_id: subscription.id,
      user_id: userId,
      is_subscribed: ["active", "trialing"].includes(subscription.status),
      subscribe_start_time: new Date(subscription.current_period_start * 1000).toISOString(),
      subscribe_end_time: new Date(subscription.current_period_end * 1000).toISOString(),
      subscribe_type: "standard", // or derive from price/product
      stripe_customer_id: subscription.customer,
    });
    
  if (error) {
    console.error("Supabase upsert error:", error);
  } else {
    console.log(`Subscription ${subscription.id} for user ${userId} upserted.`);
  }
}

export async function POST(req: Request) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET not set!");
    return new NextResponse("Server Config Error", { status: 500 });
  }

  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

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
      if (session.mode === 'subscription') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await stripe.customers.update(subscription.customer as string, {
          metadata: { userId: session.client_reference_id }
        });
        await upsertSubscription(subscription);
      } else if (session.mode === 'payment') {
        const userId = session.client_reference_id;
        const customerId = session.customer;
        
        const { error } = await supabase
          .from("subscriptions")
          .insert({
            user_id: userId,
            is_subscribed: true,
            subscribe_start_time: new Date().toISOString(),
            subscribe_end_time: new Date(new Date().setFullYear(new Date().getFullYear() + 100)).toISOString(),
            subscribe_type: "lifetime",
            stripe_customer_id: customerId,
          });

        if (error) {
          console.error("Supabase insert error for one-time payment:", error);
        } else {
          console.log(`One-time payment for user ${userId} recorded.`);
        }
      }
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await upsertSubscription(subscription);
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const { error } = await supabase
        .from('subscriptions')
        .update({ is_subscribed: false })
        .eq('stripe_subscription_id', subscription.id);
      if (error) {
        console.error("Supabase update error on delete:", error);
      } else {
        console.log(`Subscription ${subscription.id} marked as deleted.`);
      }
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return new NextResponse("OK", { status: 200 });
}
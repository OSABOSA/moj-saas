import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // UWAGA: To musi być sekret od Clerka, nie od Stripe!
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Pobieramy nagłówki Svix (Clerk używa Svix, a nie Stripe-Signature)
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)
  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, username, external_accounts } = evt.data;
    
    const discordAccount = external_accounts?.find((acc) => acc.provider === 'oauth_discord');
    const discordId = discordAccount ? discordAccount.provider_user_id : null;
    const primaryEmail = email_addresses[0]?.email_address;
    const today = new Date().toISOString().split('T')[0];

    console.log(`[CLERK] Nowy user: ${username || id}`);

    // 1. Zapisujemy usera w tabeli users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        clerk_id: id,
        email: primaryEmail,
        username: username || primaryEmail?.split('@')[0],
        discord_id: discordId
      }, { onConflict: 'clerk_id' })
      .select()
      .single();

    if (userError) {
      console.error('[CLERK] Błąd zapisu usera:', userError);
      return new Response(JSON.stringify(userError), { status: 500 });
    }

    // 2. Tworzymy mu startową subskrypcję (FREE)
    const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
            user_id: userData.id, // Tutaj używamy UUID z bazy
            is_subscribed: false,
            subscribe_type: 'FREE',
            subscribe_start_time: today,
            subscribe_end_time: null
        });

    if (subError) {
        // Ignorujemy błąd jeśli subskrypcja już istnieje (np. przy retry)
        console.error('[CLERK] Info o subskrypcji:', subError);
    } else {
        console.log('[CLERK] Utworzono subskrypcję FREE');
    }
  }

  return new Response('Webhook processed', { status: 200 })
}
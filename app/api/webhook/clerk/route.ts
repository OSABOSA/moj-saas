import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // 1. Weryfikacja nagłówków (Bezpieczeństwo)
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

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

  // 2. Inicjalizacja Supabase (Jako Admin)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Używamy service_role!
  )

  const eventType = evt.type

  // 3. Obsługa zdarzenia utworzenia użytkownika
  if (eventType === 'user.created') {
    const { id, email_addresses, username, external_accounts } = evt.data;

    // Znajdź konto Discord w powiązanych kontach
    const discordAccount = external_accounts?.find((acc) => acc.provider === 'oauth_discord');
    const discordId = discordAccount ? discordAccount.provider_user_id : null;
    
    // Główny email
    const primaryEmail = email_addresses[0]?.email_address;

    // A. Dodajemy użytkownika do tabeli 'users'
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        clerk_id: id,
        email: primaryEmail,
        username: username || primaryEmail?.split('@')[0], // Jeśli brak username, bierzemy z maila
        discord_id: discordId
      })
      .select()
      .single();

    if (userError) {
      console.error('Błąd zapisu usera:', userError);
      return new Response('Error inserting user', { status: 500 });
    }

    // B. Tworzymy automatycznie wpis w 'subscriptions'
    if (newUser) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: newUser.id, // UUID z naszej bazy
          is_subscribed: false,
          subscribe_type: 'free',
          subscribe_start_time: new Date().toISOString(), // Startujemy "free" od teraz
          subscribe_end_time: null // Bezterminowo dla free
        });

      if (subError) {
        console.error('Błąd zapisu subskrypcji:', subError);
      }
    }
  }

  return new Response('', { status: 200 })
}
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
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

    console.log(`Próba zapisu/aktualizacji usera: ${username}`);

    // 1. UPSERT USERA (Wstaw lub zaktualizuj jeśli istnieje)
    // Ważne: onConflict bazuje na kolumnie 'clerk_id', która musi być UNIQUE w bazie
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        clerk_id: id,
        email: primaryEmail,
        username: username || primaryEmail?.split('@')[0],
        discord_id: discordId
      }, { onConflict: 'clerk_id' }) // Jeśli clerk_id istnieje, nie wywalaj błędu
      .select()
      .single();

    if (userError) {
      console.error('BŁĄD UPSERT USERA:', userError);
      return new Response(JSON.stringify(userError), { status: 500 });
    }

    console.log('User OK (ID):', userData.id);

    // 2. SPRAWDŹ CZY SUBSKRYPCJA JUŻ ISTNIEJE
    const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userData.id)
        .single();

    if (!existingSub) {
        console.log('Tworzę nową subskrypcję...');
        const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
            user_id: userData.id,
            is_subscribed: false,
            subscribe_type: 'free',
            subscribe_start_time: today,
            subscribe_end_time: null
            });

        if (subError) {
            console.error('BŁĄD ZAPISU SUBSKRYPCJI:', subError);
            // Zwracamy 500 żeby Clerk ponowił próbę w razie błędu bazy
            return new Response(JSON.stringify(subError), { status: 500 });
        }
        console.log('Subskrypcja utworzona pomyślnie.');
    } else {
        console.log('Subskrypcja już istnieje, pomijam.');
    }
  }

  return new Response('Webhook processed', { status: 200 })
}
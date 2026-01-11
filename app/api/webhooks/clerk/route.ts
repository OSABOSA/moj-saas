import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  // 1. Sprawdzenie sekretu
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    console.error('Brak CLERK_WEBHOOK_SECRET')
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // 2. Weryfikacja nagłówków (Next.js 15 fix)
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

  // 3. Połączenie z Supabase (Jako Admin/Service Role)
  // UWAGA: Tu musi być SUPABASE_SERVICE_ROLE_KEY, nie ANON_KEY!
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  )

  const eventType = evt.type

  if (eventType === 'user.created') {
    const { id, email_addresses, username, external_accounts } = evt.data;
    
    // Pobieramy Discord ID jeśli istnieje
    const discordAccount = external_accounts?.find((acc) => acc.provider === 'oauth_discord');
    const discordId = discordAccount ? discordAccount.provider_user_id : null;
    
    const primaryEmail = email_addresses[0]?.email_address;
    
    // Pobieramy dzisiejszą datę w formacie YYYY-MM-DD (dla pola typu 'date')
    const today = new Date().toISOString().split('T')[0];

    console.log(`Próba zapisu usera: ${username}, Discord: ${discordId}`);

    // A. Zapis do tabeli 'users'
    // Mapujemy dane dokładnie pod Twoje kolumny ze screenshota
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        clerk_id: id,            // To pole dodaliśmy w SQL
        email: primaryEmail,
        username: username || primaryEmail?.split('@')[0],
        discord_id: discordId
        // id: generuje się samo (uuid)
      })
      .select()
      .single();

    if (userError) {
      console.error('BŁĄD ZAPISU USERA:', userError);
      // 👇 ZMIANA: Zwracamy dokładny opis błędu z bazy
      return new Response(JSON.stringify(userError), { status: 500 });
    }

    console.log('User zapisany, ID:', newUser.id);

    // B. Zapis do tabeli 'subscriptions'
    if (newUser) {
      const { error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: newUser.id,     // UUID z tabeli users
          is_subscribed: false,    //
          subscribe_type: 'free',  //
          subscribe_start_time: today, // Format daty
          subscribe_end_time: null // Brak końca subskrypcji
        });

      if (subError) {
        console.error('BŁĄD ZAPISU SUBSKRYPCJI:', subError);
        // Nie zwracamy błędu 500, bo user już jest stworzony, najwyżej subskrypcję doda się ręcznie
      } else {
        console.log('Subskrypcja FREE utworzona.');
      }
    }
  }

  return new Response('Webhook processed', { status: 200 })
}
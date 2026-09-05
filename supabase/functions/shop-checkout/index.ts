import { corsHeaders } from '../_shared/cors.ts';
import { requireUser, userClient, jsonResponse, errorResponse, HttpError } from '../_shared/supabase.ts';

// MODUL 6: Sklep PLN. NIE udaje prawdziwej płatności — jeśli dostawca (PayU/
// BLIK) nie jest skonfigurowany, tworzy zamówienie w stanie "pending" i mówi
// to wprost klientowi. Realne odblokowanie przedmiotów następuje WYŁĄCZNIE
// przez payment-webhook po potwierdzeniu wpłaty u dostawcy (fn_fulfill_order).
const PAYU_CLIENT_ID = Deno.env.get('PAYU_CLIENT_ID');
const PAYU_CLIENT_SECRET = Deno.env.get('PAYU_CLIENT_SECRET');
const PAYMENTS_CONFIGURED = !!(PAYU_CLIENT_ID && PAYU_CLIENT_SECRET);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const user = await requireUser(req);
    const { sku } = await req.json();
    if (!sku) throw new HttpError(400, 'Brak sku');

    // klient "jako uzytkownik" (nie service_role!) — rpc_create_order polega na auth.uid()
    const userSb = userClient(req.headers.get('Authorization')!);
    const { data: orderId, error } = await userSb.rpc('rpc_create_order', { p_sku: sku });
    if (error) throw new HttpError(400, error.message);

    if (!PAYMENTS_CONFIGURED) {
      return jsonResponse({
        order_id: orderId,
        status: 'pending',
        payment_configured: false,
        message: 'Dostawca płatności (PayU/BLIK) nie jest jeszcze skonfigurowany. Zamówienie zapisane jako oczekujące — ustaw PAYU_CLIENT_ID/PAYU_CLIENT_SECRET (patrz supabase/functions/.env.example).',
      });
    }

    // TODO: prawdziwa integracja — utworzyc zamowienie/checkout w PayU (OAuth
    // + POST /api/v2_1/orders), zwrocic redirectUri do platnosci BLIK/karta.
    // Po powrocie dostawca wywola payment-webhook, ktory zweryfikuje podpis
    // i dopiero wtedy wywola fn_fulfill_order — TUTAJ celowo nic wiecej sie
    // nie dzieje, zeby nie udawac "payment successful" bez realnej platnosci.
    throw new HttpError(501, 'Integracja z PayU jest skonfigurowana, ale checkout jeszcze niezaimplementowany (TODO).');
  } catch (e) {
    return errorResponse(e);
  }
});

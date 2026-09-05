import { corsHeaders } from '../_shared/cors.ts';
import { adminClient, jsonResponse, errorResponse, HttpError } from '../_shared/supabase.ts';

// MODUL 6: Webhook dostawcy platnosci (PayU/BLIK).
// TODO przed produkcja: zweryfikowac podpis/sygnature callbacku wg dokumentacji
// dostawcy (np. naglowek OpenPayu-Signature dla PayU) ZANIM cokolwiek sie zapisze.
// Bez tej weryfikacji ktokolwiek mogłby "odblokowac" sobie przedmioty — dlatego
// ten endpoint na razie tylko odrzuca zapytania (501), zamiast udawac sukces.
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const signatureHeader = req.headers.get('OpenPayu-Signature');
    if (!signatureHeader) {
      throw new HttpError(501, 'Webhook dostawcy platnosci nie jest jeszcze skonfigurowany (brak weryfikacji podpisu).');
    }

    // TODO: policzyc HMAC z body + PAYU_SECOND_KEY i porownac z signatureHeader.
    // Dopiero po pozytywnej weryfikacji:
    // const admin = adminClient();
    // await admin.rpc('fn_fulfill_order', { p_order_id, p_provider: 'payu', p_provider_ref });

    throw new HttpError(501, 'Weryfikacja podpisu PayU jeszcze niezaimplementowana (TODO).');
  } catch (e) {
    return errorResponse(e);
  }
});

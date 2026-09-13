interface Env {
  GOOGLE_SHEETS_WEBHOOK_URL?: string;
}

export const onRequestPost = async (context: { request: Request; env: Env }) => {
  const { request, env } = context;

  try {
    const orderData = await request.json();

    if (!orderData) {
      return new Response(JSON.stringify({ error: 'No order data provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Forward to Google Sheets webhook if configured in Cloudflare environment
    const webhookUrl = env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
      } catch (webhookErr) {
        console.warn('Error forwarding order to Google Sheets:', webhookErr);
      }
    }

    return new Response(
      JSON.stringify({
        status: 'success',
        message: 'Orden registrada correctamente en el servidor',
        orderNumber: (orderData as any)?.orderNumber,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message || 'Error processing order' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

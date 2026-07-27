const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    if (request.method === "GET") {
      return json({ ok: true, service: "DRACOMANIA payment mail endpoint" });
    }

    if (request.method !== "POST") {
      return json({ ok: false, error: "method-not-allowed" }, 405);
    }

    try {
      const payload = await readPayload(request);
      const action = payload.action || "send-order";

      if (action === "paypal-create-order") {
        return json(await createPayPalOrder(payload.order, env));
      }

      if (action === "paypal-capture-order") {
        return json(await capturePayPalOrder(payload.order, payload.paypalOrderId, env));
      }

      if (action === "qik-payment-notice") {
        const order = markOrderPaid(payload.order, {
          provider: "qik",
          providerOrderId: payload.qikPaymentId || payload.paymentId || "",
        });
        await sendOrderEmail(order, env);
        return json({ ok: true, order });
      }

      await sendOrderEmail(payload.order || payload, env);
      return json({ ok: true });
    } catch (error) {
      return json({ ok: false, error: String(error.message || error) }, 500);
    }
  },
};

async function readPayload(request) {
  const text = await request.text();
  if (!text) return {};
  return JSON.parse(text);
}

async function createPayPalOrder(order, env) {
  assertOrder(order);
  const accessToken = await getPayPalAccessToken(env);
  const amount = getPayPalAmount(order, env);
  const response = await fetch(`${getPayPalBaseUrl(env)}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `${order.orderNumber}-create`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        invoice_id: order.orderNumber,
        description: `DRACOMANIA ${order.orderNumber}`,
        amount: {
          currency_code: env.PAYPAL_CURRENCY || "USD",
          value: amount,
        },
      }],
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "paypal-create-failed");
  return { ok: true, paypalOrderId: data.id };
}

async function capturePayPalOrder(order, paypalOrderId, env) {
  assertOrder(order);
  if (!paypalOrderId) throw new Error("missing-paypal-order-id");

  const accessToken = await getPayPalAccessToken(env);
  const response = await fetch(`${getPayPalBaseUrl(env)}/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `${order.orderNumber}-capture`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "paypal-capture-failed");
  if (data.status !== "COMPLETED") throw new Error(`paypal-status-${data.status}`);

  const capture = data.purchase_units?.[0]?.payments?.captures?.[0] || {};
  const paidOrder = markOrderPaid(order, {
    provider: "paypal",
    providerOrderId: paypalOrderId,
    captureId: capture.id || "",
    paidCurrency: capture.amount?.currency_code || env.PAYPAL_CURRENCY || "USD",
    paidAmount: capture.amount?.value || getPayPalAmount(order, env),
  });

  await sendOrderEmail(paidOrder, env);
  return { ok: true, order: paidOrder, paypal: data };
}

function markOrderPaid(order, payment) {
  return {
    ...order,
    status: "Pago confirmado",
    payment: {
      ...(order.payment || {}),
      ...payment,
      status: "paid",
      paidAt: new Date().toISOString(),
    },
  };
}

async function getPayPalAccessToken(env) {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) {
    throw new Error("missing-paypal-credentials");
  }

  const credentials = btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`);
  const response = await fetch(`${getPayPalBaseUrl(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || "paypal-auth-failed");
  return data.access_token;
}

function getPayPalBaseUrl(env) {
  return env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

function getPayPalAmount(order, env) {
  const currency = env.PAYPAL_CURRENCY || "USD";
  if (currency === "USD") {
    const dopPerUsd = Number(env.PAYPAL_DOP_PER_USD || 60);
    return (Number(order.total || 0) / dopPerUsd).toFixed(2);
  }
  return Number(order.total || 0).toFixed(2);
}

async function sendOrderEmail(order, env) {
  assertOrder(order);
  if (!env.RESEND_API_KEY || !env.ORDER_EMAIL || !env.RESEND_FROM) {
    throw new Error("missing-resend-config");
  }

  const text = buildOrderText(order);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.RESEND_FROM,
      to: [env.ORDER_EMAIL],
      reply_to: order.customer.email,
      subject: `${order.status}: ${order.orderNumber} - DRACOMANIA`,
      text,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "resend-failed");
}

function buildOrderText(order) {
  const items = (order.items || [])
    .map(item => `${item.quantity}x ${item.name} (${item.size}) - RD$${item.total}`)
    .join("\n");
  const payment = order.payment || {};

  return `
Nueva orden DRACOMANIA

Orden: ${order.orderNumber}
Estado: ${order.status}
Pago: ${payment.provider || payment.method || "no indicado"} / ${payment.status || "pendiente"}
Referencia: ${payment.captureId || payment.providerOrderId || "N/A"}

Cliente:
Nombre: ${order.customer.name}
Correo: ${order.customer.email}
Telefono: ${order.customer.phone}
Direccion: ${order.customer.address}
Ciudad: ${order.customer.city}
Pais: ${order.customer.country}
Codigo postal: ${order.customer.zip}

Productos:
${items}

Subtotal: RD$${order.subtotal}
Envio: RD$${order.shipping}
Total: RD$${order.total}
`.trim();
}

function assertOrder(order) {
  if (!order || !order.orderNumber || !order.customer || !Array.isArray(order.items)) {
    throw new Error("invalid-order");
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json;charset=utf-8",
    },
  });
}

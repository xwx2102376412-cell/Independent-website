const base = () => process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

export async function paypalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID; const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal Sandbox credentials are not configured.");
  const response = await fetch(`${base()}/v1/oauth2/token`, { method: "POST", headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`, "content-type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials", cache: "no-store" });
  if (!response.ok) throw new Error("PayPal authentication failed."); const data = await response.json() as { access_token: string }; return data.access_token;
}

export async function paypalRequest(path: string, init: RequestInit = {}) {
  const token = await paypalAccessToken(); return fetch(`${base()}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, "content-type": "application/json", Prefer: "return=representation", ...init.headers }, cache: "no-store" });
}

export async function verifyPayPalWebhook(request: Request, event: unknown) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID; if (!webhookId) return false;
  const response = await paypalRequest("/v1/notifications/verify-webhook-signature", { method: "POST", body: JSON.stringify({ auth_algo: request.headers.get("paypal-auth-algo"), cert_url: request.headers.get("paypal-cert-url"), transmission_id: request.headers.get("paypal-transmission-id"), transmission_sig: request.headers.get("paypal-transmission-sig"), transmission_time: request.headers.get("paypal-transmission-time"), webhook_id: webhookId, webhook_event: event }) });
  if (!response.ok) return false; const result = await response.json() as { verification_status?: string }; return result.verification_status === "SUCCESS";
}

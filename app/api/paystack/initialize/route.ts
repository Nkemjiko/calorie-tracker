function jsonRes(body: unknown, status = 200) {
  return Response.json(body, { status })
}

const VALID_AMOUNTS: Record<string, { NGN: number; USD: number }> = {
  monthly: { NGN: 2500, USD: 2.99 },
  yearly: { NGN: 20000, USD: 24.99 },
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan, amount, currency, accessToken } = body as {
      plan: string;
      amount: number;
      currency: "NGN" | "USD";
      accessToken?: string;
    };

    if (!accessToken) {
      return jsonRes({ error: "Authentication required." }, 401);
    }

    const validPlans = ["monthly", "yearly"];
    if (!validPlans.includes(plan)) {
      return jsonRes({ error: "Invalid plan selected." }, 400);
    }

    const resolvedCurrency = currency === "NGN" ? "NGN" : "USD";
    const expectedAmount = VALID_AMOUNTS[plan][resolvedCurrency];

    if (amount !== expectedAmount) {
      return jsonRes({ error: "Invalid amount for selected plan." }, 400);
    }

    const paystackKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackKey) {
      return jsonRes({
        error: "Payment service is not yet configured. Please try again later.",
      }, 503);
    }

    // TODO: Implement Paystack checkout initialization
    // 1. Fetch user email from Supabase using accessToken
    // 2. Call Paystack API: POST https://api.paystack.co/transaction/initialize
    //    with { email, amount: amount * 100, currency: resolvedCurrency, callback_url, metadata: { plan } }
    // 3. Return { authorization_url } from Paystack response

    return jsonRes({
      error: "Paystack integration is coming soon. Please check back later.",
    }, 501);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonRes({ error: `Payment initialization failed: ${message}` }, 500);
  }
}

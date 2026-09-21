function jsonRes(body: unknown, status = 200) {
  return Response.json(body, { status })
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { plan, amount, accessToken } = body as {
      plan: string;
      amount: number;
      accessToken?: string;
    };

    if (!accessToken) {
      return jsonRes({ error: "Authentication required." }, 401);
    }

    const validPlans = ["monthly", "yearly"];
    if (!validPlans.includes(plan)) {
      return jsonRes({ error: "Invalid plan selected." }, 400);
    }

    const validAmounts: Record<string, number> = {
      monthly: 2500,
      yearly: 20000,
    };

    if (amount !== validAmounts[plan]) {
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
    //    with { email, amount: amount * 100, callback_url, metadata: { plan } }
    // 3. Return { authorization_url } from Paystack response

    return jsonRes({
      error: "Paystack integration is coming soon. Please check back later.",
    }, 501);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonRes({ error: `Payment initialization failed: ${message}` }, 500);
  }
}

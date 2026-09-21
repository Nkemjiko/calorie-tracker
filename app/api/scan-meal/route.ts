import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createClient } from "@supabase/supabase-js";

const FREE_DAILY_SCAN_LIMIT = 3;

const SYSTEM_PROMPT = `You are an expert nutritionist specializing in Nigerian and global cuisines. Analyze the image carefully. Identify the dish (especially if it is a Nigerian meal like Jollof Rice, Eba, Egusi Soup, Amala, Suya, Pounded Yam, Akara, Moi Moi, Pepper Soup, etc.), estimate the portion size based on visual cues, and estimate the total calories, protein, carbs, and fat.

Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "food_name": "string - the dish name",
  "category": "string - one of: Swallows, Soups & Stews, Rice & Grains, Proteins, Breakfast & Drinks, Snacks & Street Food, Fast Foods",
  "serving_unit": "string - e.g. 'wrap', 'plate', 'bowl', 'piece', 'serving'",
  "base_calories": number - estimated calories per serving,
  "protein_g": number - grams of protein,
  "carbs_g": number - grams of carbs,
  "fat_g": number - grams of fat,
  "confidence_score": number - 0 to 1 confidence in identification
}

Be conservative with estimates. If you cannot identify the food, return confidence_score of 0 and food_name "Unknown Dish".`;

function jsonRes(body: unknown, status = 200) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, accessToken } = body as {
      image: string;
      accessToken?: string;
    };

    if (!image) {
      return jsonRes({ error: "No image provided" }, 400);
    }

    // --- Auth: require a valid user session ---
    if (!accessToken) {
      return jsonRes(
        { error: "Authentication required to scan meals." },
        401
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      }
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return jsonRes(
        { error: "Authentication required to scan meals." },
        401
      );
    }

    const userId = userData.user.id;

    // --- Fetch profile for quota + Pro status ---
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro, ai_scans_today, last_scan_date")
      .eq("id", userId)
      .maybeSingle();

    const today = new Date().toISOString().slice(0, 10);
    const isPro = profile?.is_pro ?? false;
    const lastScanDate = profile?.last_scan_date
      ? new Date(profile.last_scan_date).toISOString().slice(0, 10)
      : null;
    let scansToday = profile?.ai_scans_today ?? 0;

    // --- Reset daily counter if date changed ---
    if (lastScanDate !== today) {
      scansToday = 0;
      await supabase
        .from("profiles")
        .update({ ai_scans_today: 0, last_scan_date: today })
        .eq("id", userId);
    }

    // --- Enforce free-tier daily limit ---
    if (!isPro && scansToday >= FREE_DAILY_SCAN_LIMIT) {
      return jsonRes(
        {
          error:
            "You have reached your daily limit of 3 free AI scans. Upgrade to Pro for unlimited scans.",
          quotaExceeded: true,
          scansUsed: scansToday,
          dailyLimit: FREE_DAILY_SCAN_LIMIT,
          isPro: false,
        },
        403
      );
    }

    // --- Gemini API key check ---
    const geminiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!geminiKey) {
      return jsonRes(
        {
          error: "AI scanner is not configured. Add your Google Gemini API key to enable meal photo scanning.",
          fallback: true,
        },
        503
      );
    }

    // --- Call Gemini Flash ---
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });

    let text: string;
    try {
      const result = await generateText({
        model: google("gemini-2.5-flash"),
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: [{ type: "image", image }],
          },
        ],
        maxTokens: 500,
        temperature: 0.3,
      });
      text = result.text;
    } catch (aiError) {
      const msg =
        aiError instanceof Error ? aiError.message : "AI service unavailable";
      return jsonRes(
        {
          error: `AI analysis failed: ${msg}. You can still log your meal manually.`,
          fallback: true,
        },
        502
      );
    }

    // --- Parse response ---
    let parsed: {
      food_name: string;
      category: string;
      serving_unit: string;
      base_calories: number;
      protein_g: number;
      carbs_g: number;
      fat_g: number;
      confidence_score: number;
    };

    try {
      const cleaned = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return jsonRes(
        {
          error: "Could not parse the AI response. Please try again or log your meal manually.",
          fallback: true,
        },
        500
      );
    }

    // --- Increment scan count (only after successful AI response) ---
    const newCount = scansToday + 1;
    await supabase
      .from("profiles")
      .update({
        ai_scans_today: newCount,
        last_scan_date: today,
      })
      .eq("id", userId);

    return jsonRes({
      ...parsed,
      scansUsed: newCount,
      dailyLimit: isPro ? null : FREE_DAILY_SCAN_LIMIT,
      isPro,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonRes(
      {
        error: `Something went wrong: ${message}. You can still log your meal manually.`,
        fallback: true,
      },
      500
    );
  }
}

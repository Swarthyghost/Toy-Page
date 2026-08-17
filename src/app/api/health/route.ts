import { NextResponse } from "next/server";

export async function GET() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const checks = {
    apiKeyExists: !!geminiKey,
    apiReachable: false,
    modelAvailable: false,
    endpointResponding: false,
    provider: "unknown",
    model: "unknown",
    error: null as string | null
  };

  if (!geminiKey) {
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      checks,
      error: "Missing GEMINI_API_KEY environment variable in process.env."
    }, { status: 400 });
  }

  try {
    // Google Gemini's OpenAI-compatible endpoint — free tier, no credit card required.
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
    const modelsToTry = ['gemini-flash-latest', 'gemini-flash-lite-latest'];
    const provider = "Gemini";
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${geminiKey}`
    };

    checks.provider = provider;

    // Test request — fall back to the lite model if the primary is momentarily
    // overloaded (503), same as the main assistant route.
    const startTime = Date.now();
    let res: Response;
    let model = modelsToTry[0];
    for (const candidateModel of modelsToTry) {
      model = candidateModel;
      res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: candidateModel,
          messages: [{ role: 'user', content: 'Say OK' }],
          max_tokens: 10
        })
      });
      if (res.status !== 503) break;
    }
    checks.model = model;

    checks.apiReachable = true;

    if (res.status === 401) {
      throw new Error("Invalid API Key (Unauthorized)");
    } else if (res.status === 404) {
      throw new Error(`Model ${model} not found`);
    } else if (res.status === 429) {
      throw new Error("Rate limit exceeded");
    } else if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API returned status ${res.status}: ${errText}`);
    }

    const data = await res.json();
    if (data.choices && data.choices[0]) {
      checks.modelAvailable = true;
      checks.endpointResponding = true;
    } else if (data.error) {
      throw new Error(data.error.message || JSON.stringify(data.error));
    } else {
      throw new Error("Invalid completion response format");
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      responseTimeMs: Date.now() - startTime,
      checks
    });

  } catch (err: any) {
    console.error("Health check error:", err);
    checks.error = err.message || String(err);
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      checks,
      error: err.message || String(err)
    }, { status: 500 });
  }
}

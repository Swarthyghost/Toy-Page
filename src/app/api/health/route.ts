import { NextResponse } from "next/server";

export async function GET() {
  const groqKey = process.env.GROQ_API_KEY;
  const checks = {
    apiKeyExists: !!groqKey,
    apiReachable: false,
    modelAvailable: false,
    endpointResponding: false,
    provider: "unknown",
    model: "unknown",
    error: null as string | null
  };

  if (!groqKey) {
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      checks,
      error: "Missing GROQ_API_KEY environment variable in process.env."
    }, { status: 400 });
  }

  try {
    // Determine provider & endpoint
    let endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    let model = 'meta-llama/llama-3.3-70b-instruct';
    let provider = "OpenRouter";
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`
    };

    if (groqKey.startsWith('gsk_')) {
      endpoint = 'https://api.groq.com/openai/v1/chat/completions';
      model = 'llama-3.3-70b-specdec';
      provider = "Groq Direct";
    } else {
      headers['HTTP-Referer'] = 'https://pleasuretoysgh.com/';
      headers['X-Title'] = 'PleasureToys GH';
    }

    checks.provider = provider;
    checks.model = model;

    // Test request
    const startTime = Date.now();
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 10
      })
    });

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

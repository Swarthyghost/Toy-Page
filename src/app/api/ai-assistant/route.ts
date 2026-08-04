import { NextRequest, NextResponse } from 'next/server';
import { dbAdmin } from '../../../config/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { message, chatHistory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Fetch current business data using Admin SDK to bypass security rules
    const productsSnap = await dbAdmin.collection('products').get();
    const salesSnap = await dbAdmin.collection('sales').get();
    const expensesSnap = await dbAdmin.collection('expenses').get();

    const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const sales = salesSnap.docs.map(d => {
      const data = d.data();
      let dateStr = '';
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === 'function') {
          dateStr = data.createdAt.toDate().toISOString();
        } else if (data.createdAt._seconds) {
          dateStr = new Date(data.createdAt._seconds * 1000).toISOString();
        } else {
          dateStr = new Date(data.createdAt).toISOString();
        }
      }
      return {
        id: d.id,
        ...data,
        createdAt: dateStr,
      };
    });
    const expenses = expensesSnap.docs.map(d => {
      const data = d.data();
      let dateStr = '';
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === 'function') {
          dateStr = data.createdAt.toDate().toISOString();
        } else if (data.createdAt._seconds) {
          dateStr = new Date(data.createdAt._seconds * 1000).toISOString();
        } else {
          dateStr = new Date(data.createdAt).toISOString();
        }
      }
      return {
        id: d.id,
        ...data,
        createdAt: dateStr,
      };
    });

    // 2. Prepare concise summaries to save tokens
    const productSummary = products.map((p: any) => 
      `- ${p.name} (ID: ${p.id}) | Category: ${p.category} | Type: ${p.productType || 'Adult Products'} | Stock: ${p.currentStock}/${p.minimumStock} | Cost: GH₵${p.costPrice} | Retail: GH₵${p.price}`
    ).join('\n');

    const salesSummary = sales.map((s: any) => 
      `- ${s.createdAt.substring(0,10)} | ${s.productName} | Qty: ${s.quantity} | Rev: GH₵${s.price * s.quantity} | Profit: GH₵${s.profit.toFixed(2)} | Platform: ${s.platform} | Pay: ${s.paymentMethod}`
    ).join('\n');

    const expensesSummary = expenses.map((e: any) => 
      `- ${e.createdAt.substring(0,10)} | Category: ${e.category} | Amt: GH₵${e.amount} | Desc: ${e.description}`
    ).join('\n');

    // 3. Construct System Prompt
    const systemPrompt = `You are a premium Retail OS Business Operations Assistant for PleasureToys GH.
You have read-only access to the store's current inventory, sales ledger, and expenses outlays.
Answer business questions accurately based ONLY on the provided store data below.

CURRENT LOCAL TIME: ${new Date().toISOString()}

=== INVENTORY DATABASE ===
${productSummary || 'No products available.'}

=== SALES LEDGER ===
${salesSummary || 'No sales logged.'}

=== EXPENSES OUTLAYS ===
${expensesSummary || 'No expenses recorded.'}

=== BUSINESS ENGINE FORMULAS ===
- Revenue = Selling Price * Quantity
- Cost of Goods Sold (COGS) = Cost Price * Quantity
- Gross Profit = Revenue - COGS - Discount
- Net Profit = Gross Profit - Total Expenses

=== PRIMARY DUTIES ===
1. **Chat & Business Intelligence:**
   - Answer operational questions (e.g., profit today, low stock, compare months, category revenues).
   - Generate Daily, Weekly, Monthly, Quarterly, and Yearly reports when requested.
   - Use professional markdown formatting in your response.

2. **Smart Sales Import:**
   - If the user provides a copied-and-pasted list of sales transactions (e.g. "Rose Sucker 350", "Rose Sucker x2 700", "1 July Rose Sucker"), parse them.
   - Match product names against the INVENTORY DATABASE using fuzzy matching (e.g. "Rose Tongue" -> "Rose Tongue Licker", "AV Wand" -> "AV Wand Vibrator").
   - Set the correct "productId" and normalized "productName" from the database.
   - If multiple products match, or no product matches, leave "productId" empty, add a warning, and ask the user to clarify.
   - Default date to the current date (YYYY-MM-DD) if no date is specified.
   - Default platform to "Walk-in" and paymentMethod to "MoMo" if not specified.
   - Set "responseType" to "import_preview", list the parsed sales in "parsedSales", and explain the preview in your "reply".

=== OUTPUT FORMAT REQUIREMENTS ===
You must output a single JSON object matching the requested schema:
- "responseType": "chat" or "import_preview"
- "reply": Your assistant markdown response.
- "parsedSales": (only for import_preview) list of parsed sales records.
- "warnings": list of match warnings.
- "skippedRows": list of rows that could not be parsed.`;

    const groqKey = process.env.GROQ_API_KEY;

    if (!groqKey) {
      console.error("[AI Assistant] Error: Missing GROQ_API_KEY environment variable.");
      return NextResponse.json({
        error: "Missing GROQ_API_KEY. Please ensure the GROQ_API_KEY environment variable is configured in your .env file."
      }, { status: 400 });
    }

    // 1. Determine Endpoint, Provider & Model
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

    console.log(`[AI Assistant] Request received. Provider: ${provider}, Model: ${model}`);

    // 2. Format Messages for OpenAI Chat Completions API spec
    const chatCompletionsMessages = [
      { role: 'system', content: systemPrompt }
    ];

    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        chatCompletionsMessages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    chatCompletionsMessages.push({
      role: 'user',
      content: `User Question: ${message}`
    });

    // 3. Execute Request
    console.log(`[AI Assistant] API request started to ${provider} (${endpoint})...`);
    const startTime = Date.now();
    let res;

    try {
      res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: chatCompletionsMessages,
          max_tokens: 2048,
          response_format: { type: 'json_object' }
        })
      });
    } catch (netErr: any) {
      console.error("[AI Assistant] Network Error calling API:", netErr);
      return NextResponse.json({
        error: `Network Error: Failed to connect to ${provider} API. ${netErr.message || netErr}`
      }, { status: 502 });
    }

    const duration = Date.now() - startTime;
    console.log(`[AI Assistant] API response received in ${duration}ms. Status: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`[AI Assistant] API Error response (Status ${res.status}):`, errorText);
      let errorMsg = `API Error (Status ${res.status})`;

      try {
        const parsed = JSON.parse(errorText);
        errorMsg = parsed.error?.message || parsed.message || errorMsg;
      } catch (_) {}

      // Map upstream HTTP status codes to clean developer descriptions
      if (res.status === 401) {
        return NextResponse.json({ error: "Unauthorized: Invalid API Key. Please verify your GROQ_API_KEY configuration." }, { status: 401 });
      } else if (res.status === 404) {
        return NextResponse.json({ error: `Model Not Found: The model '${model}' is not available on ${provider}.` }, { status: 404 });
      } else if (res.status === 429) {
        return NextResponse.json({ error: "Rate Limit Exceeded: Too many requests sent to the AI provider." }, { status: 429 });
      } else if (res.status === 400) {
        return NextResponse.json({ error: `Invalid Request: The provider rejected the payload. Details: ${errorMsg}` }, { status: 400 });
      } else {
        return NextResponse.json({ error: `Upstream API Failure: ${errorMsg}` }, { status: res.status });
      }
    }

    const responseData = await res.json();
    const choice = responseData.choices?.[0];

    if (choice?.finish_reason === 'error' && choice?.error) {
      const errorMsg = choice.error.message || JSON.stringify(choice.error);
      console.error("[AI Assistant] Upstream choice error:", errorMsg);
      return NextResponse.json({ error: `Upstream API Error: ${errorMsg}` }, { status: 502 });
    }

    let text = choice?.message?.content || '{}';
    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    }

    try {
      const result = JSON.parse(text);
      return NextResponse.json(result);
    } catch (jsonErr) {
      console.error("[AI Assistant] JSON parse error of AI response:", text, jsonErr);
      return NextResponse.json({
        error: "Invalid Request: Failed to parse structural response output from AI provider."
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in AI Assistant API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const { message, chatHistory } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // 1. Fetch current business data
    const productsSnap = await getDocs(collection(db, 'products'));
    const salesSnap = await getDocs(collection(db, 'sales'));
    const expensesSnap = await getDocs(collection(db, 'expenses'));

    const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const sales = salesSnap.docs.map(d => {
      const data = d.data();
      let dateStr = '';
      if (data.createdAt) {
        if (typeof data.createdAt.toDate === 'function') {
          dateStr = data.createdAt.toDate().toISOString();
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

    if (groqKey) {
      // 1. Determine Endpoint & Model
      let endpoint = 'https://openrouter.ai/api/v1/chat/completions';
      let model = 'google/gemini-2.5-flash';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`
      };

      if (groqKey.startsWith('gsk_')) {
        endpoint = 'https://api.groq.com/openai/v1/chat/completions';
        model = 'llama-3.3-70b-specdec';
      } else {
        headers['HTTP-Referer'] = 'https://pleasuretoysgh.com/';
        headers['X-Title'] = 'PleasureToys GH';
      }

      // 2. Prepare Messages Array
      const openRouterMessages = [
        { role: 'system', content: systemPrompt }
      ];
      if (chatHistory && Array.isArray(chatHistory)) {
        for (const msg of chatHistory) {
          openRouterMessages.push({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content
          });
        }
      }
      openRouterMessages.push({
        role: 'user',
        content: `User Question: ${message}`
      });

      // 3. Request Completion
      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model,
          messages: openRouterMessages,
          response_format: { type: 'json_object' }
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`AI API request failed: ${res.status} - ${errorText}`);
      }

      const responseData = await res.json();
      let text = responseData.choices?.[0]?.message?.content || '{}';
      if (text.startsWith('```')) {
        text = text.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      }
      const result = JSON.parse(text);
      return NextResponse.json(result);
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format chat history for Gemini
    const contents = [];
    if (chatHistory && Array.isArray(chatHistory)) {
      for (const msg of chatHistory) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        });
      }
    }
    
    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            responseType: { type: 'STRING', enum: ['chat', 'import_preview'] },
            reply: { type: 'STRING', description: 'Your main chat reply or import explanation in markdown format.' },
            parsedSales: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  date: { type: 'STRING', description: 'Normalized transaction date in YYYY-MM-DD format.' },
                  productName: { type: 'STRING', description: 'Normalized product name matched in the catalog.' },
                  productId: { type: 'STRING', description: 'Firestore product ID. Must be empty string if unmatched.' },
                  quantity: { type: 'INTEGER', description: 'Quantity sold. Defaults to 1 if not specified.' },
                  price: { type: 'NUMBER', description: 'Selling price per item.' },
                  discount: { type: 'NUMBER', description: 'Discount applied to the transaction. Defaults to 0.' },
                  platform: { type: 'STRING', enum: ['Website', 'WhatsApp', 'Instagram', 'Facebook', 'Jiji', 'Walk-in', 'Referral'] },
                  notes: { type: 'STRING', description: 'Any notes or additional info. Default to empty string.' }
                },
                required: ['date', 'productName', 'quantity', 'price', 'discount', 'platform']
              }
            },
            skippedRows: {
              type: 'ARRAY',
              items: { type: 'STRING' }
            },
            warnings: {
              type: 'ARRAY',
              items: { type: 'STRING' }
            }
          },
          required: ['responseType', 'reply']
        }
      }
    });

    let text = response.text || '{}';
    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    }
    const result = JSON.parse(text);
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in AI Assistant API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
      `- ${p.name} (ID: ${p.id}) | Category: ${p.category} | Stock: ${p.currentStock}/${p.minimumStock} | Cost: GH₵${p.costPrice} | Retail: GH₵${p.price}`
    ).join('\n');

    const salesSummary = sales.map((s: any) => 
      `- ${s.createdAt.substring(0,10)} | ${s.productName} | Qty: ${s.quantity} | Rev: GH₵${s.price * s.quantity} | Profit: GH₵${s.profit.toFixed(2)} | Platform: ${s.platform} | Pay: ${s.paymentMethod}`
    ).join('\n');

    const expensesSummary = expenses.map((e: any) => 
      `- ${e.createdAt.substring(0,10)} | Category: ${e.category} | Amt: GH₵${e.amount} | Desc: ${e.description}`
    ).join('\n');

    // 3. Construct System Prompt
    const systemPrompt = `You are a premium Retail OS Business Assistant for PleasureToys GH.
You have read-only access to the store's current inventory, sales ledger, and expenses outlays.
Answer business questions accurately based ONLY on the provided store data below.

CURRENT LOCAL TIME: ${new Date().toISOString()}

=== INVENTORY DATABASE ===
${productSummary || 'No products available.'}

=== SALES LEDGER (From Cloud Firestore) ===
${salesSummary || 'No sales logged.'}

=== EXPENSES OUTLAYS (From Cloud Firestore) ===
${expensesSummary || 'No expenses recorded.'}

=== BUSINESS ENGINE FORMULAS ===
- Revenue = Selling Price * Quantity
- Cost of Goods Sold (COGS) = Cost Price * Quantity
- Gross Profit = Revenue - COGS - Discount
- Net Profit = Gross Profit - Total Expenses

Ensure all calculations are precise. If a user asks for restock recommendation, highlight items where stock <= minimumStock.
If they ask for run-out estimation, calculate daily sales velocity of the product (total quantity sold / number of active days in sales log) and divide current stock by that velocity.
Answer clearly, concisely, using Markdown formatting with professional styling.`;

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
    });

    const reply = response.text || "I apologize, but I couldn't formulate a response. Please try again.";
    return NextResponse.json({ reply });

  } catch (error) {
    console.error('Error in AI Assistant API route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

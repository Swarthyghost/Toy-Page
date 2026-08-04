"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  Package, 
  AlertOctagon, 
  DollarSign, 
  Zap,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Play,
  FileSpreadsheet,
  HelpCircle,
  Plus,
  Trash2,
  FileText
} from 'lucide-react';
import { marked } from 'marked';
import { 
  fetchProducts, 
  bulkImportSales, 
  Product, 
  ParsedImportSale 
} from '../../services/firebaseApi';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your complete Business Operations Assistant. I can help you analyze metrics, answer questions, or **bulk import historical sales logs**. Just paste your unstructured sales text or WhatsApp reports here, and I'll clean and match the products!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Products list for fuzzy matching/selection in the table
  const [products, setProducts] = useState<Product[]>([]);
  
  // Raw text import state
  const [rawLogs, setRawLogs] = useState('');
  const [isImportingLogs, setIsImportingLogs] = useState(false);

  // Parsed results preview state
  const [parsedSales, setParsedSales] = useState<ParsedImportSale[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [skippedRows, setSkippedRows] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Last import stats
  const [lastImportStats, setLastImportStats] = useState<{
    importedCount: number;
    revenue: number;
    profit: number;
    stockUpdatedCount: number;
    durationMs: number;
  } | null>(null);

  const [mobileTab, setMobileTab] = useState<'chat' | 'import'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    { text: "What was today's profit?", icon: TrendingUp },
    { text: "Which products need restocking?", icon: Package },
    { text: "What are my fastest-moving products?", icon: Zap },
    { text: "Analyze monthly sales and category revenues", icon: DollarSign },
  ];

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          chatHistory: messages.slice(-10)
        })
      });
      const data = await response.json();
      
      if (data.responseType === 'import_preview') {
        setParsedSales(data.parsedSales || []);
        setWarnings(data.warnings || []);
        setSkippedRows(data.skippedRows || []);
        setShowPreview(true);
        setMobileTab('import');
        
        const introMsg = data.reply || "I've parsed the sales records you supplied. You can review and modify them in the Operations preview panel on the right before committing.";
        setMessages(prev => [...prev, { role: 'assistant', content: introMsg }]);
      } else if (data.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I couldn't fetch a reply. Make sure your API Keys are configured." }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred while communicating with the assistant. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleRawTextParse = async () => {
    if (!rawLogs.trim() || isImportingLogs) return;
    setIsImportingLogs(true);
    
    // Add user message to chat to document the action
    setMessages(prev => [...prev, { role: 'user', content: `Parse the following sales logs:\n\n${rawLogs}` }]);
    
    try {
      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Parse these sales:\n${rawLogs}`,
          chatHistory: []
        })
      });
      const data = await response.json();
      
      setParsedSales(data.parsedSales || []);
      setWarnings(data.warnings || []);
      setSkippedRows(data.skippedRows || []);
      setShowPreview(true);
      setMobileTab('import');
      
      const introMsg = data.reply || "Successfully parsed the sales logs. Please verify the entries in the Operations preview table.";
      setMessages(prev => [...prev, { role: 'assistant', content: introMsg }]);
      setRawLogs('');
    } catch (error) {
      console.error(error);
      alert("Failed to parse logs. Check API key configuration.");
    } finally {
      setIsImportingLogs(false);
    }
  };

  const handleFieldChange = (index: number, field: keyof ParsedImportSale, value: any) => {
    setParsedSales(prev => {
      const copy = [...prev];
      if (field === 'productId') {
        const prod = products.find(p => p.id === value);
        copy[index] = {
          ...copy[index],
          productId: value,
          productName: prod ? prod.name : copy[index].productName
        };
      } else {
        copy[index] = {
          ...copy[index],
          [field]: value
        };
      }
      return copy;
    });
  };

  const handleRemoveRow = (index: number) => {
    setParsedSales(prev => prev.filter((_, i) => i !== index));
  };

  const handleCommitImport = async () => {
    if (parsedSales.length === 0) return;
    const startTime = Date.now();
    setLoading(true);

    try {
      const summary = await bulkImportSales(parsedSales);
      const durationMs = Date.now() - startTime;

      setLastImportStats({
        ...summary,
        durationMs
      });

      // Clear preview
      setParsedSales([]);
      setWarnings([]);
      setSkippedRows([]);
      setShowPreview(false);

      // Append success message in chat
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `### 🎉 Bulk Sales Import Successful!\n\n- **Records Processed:** ${summary.importedCount} transactions\n- **Inventory Products Deducted:** ${summary.stockUpdatedCount} items\n- **Total Revenue:** GH₵${summary.revenue.toFixed(2)}\n- **Total Profit Calculated:** GH₵${summary.profit.toFixed(2)}\n- **Execution Duration:** ${(durationMs / 1000).toFixed(2)} seconds\n\nAll stock levels have been dynamically reconciled and logged to the history database.`
      }]);

      alert("Import committed successfully!");
    } catch (err: any) {
      console.error(err);
      alert(`Import failed: ${err.message || 'Firestore write error.'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
    try {
      return { __html: marked.parse(text) };
    } catch (e) {
      return { __html: text };
    }
  };

  return (
    <div className="px-6 space-y-6 max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-220px)] lg:h-[calc(100vh-140px)]">
      
      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-zinc-900 border border-white/5 p-1 rounded-2xl w-full flex-shrink-0">
        <button 
          onClick={() => setMobileTab('chat')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            mobileTab === 'chat' ? 'bg-primary text-white shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          AI Chat
        </button>
        <button 
          onClick={() => setMobileTab('import')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            mobileTab === 'import' ? 'bg-primary text-white shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Smart Import
          {parsedSales.length > 0 && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Column 1: Chat Assistant */}
      <div className={`flex-1 flex flex-col bg-zinc-950 border border-white/5 rounded-[2rem] p-6 h-full overflow-hidden ${
        mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold font-display text-white">AI Operations Assistant</h2>
              <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Reconcile stock, import sales logs, or query reports.</p>
            </div>
          </div>
        </div>

        {/* Messages Window */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800 my-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white ${
                msg.role === 'user' 
                  ? 'bg-zinc-800 border border-white/10' 
                  : 'bg-primary/20 border border-primary/30 text-primary'
              }`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-zinc-800 border border-white/5 text-zinc-200'
                  : 'bg-zinc-900/60 border border-white/5 text-zinc-300'
              }`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                ) : (
                  <div 
                    className="prose prose-invert max-w-none text-xs space-y-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4"
                    dangerouslySetInnerHTML={renderMarkdown(msg.content)} 
                  />
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0">
                <Bot size={14} />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-zinc-900/60 border border-white/5 text-zinc-500 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                <span className="font-bold">Analyzing Retail OS logs...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts & Input */}
        <div className="mt-auto space-y-4 flex-shrink-0">
          {messages.length === 1 && !loading && (
            <div className="grid grid-cols-2 gap-3">
              {samplePrompts.map((prompt, idx) => {
                const Icon = prompt.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt.text)}
                    className="flex items-center gap-2 text-left p-3.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-2xl transition-all text-[11px] text-zinc-400 font-semibold hover:text-white cursor-pointer"
                  >
                    <Icon size={12} className="text-primary flex-shrink-0" />
                    <span className="truncate">{prompt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="flex items-center gap-2 bg-zinc-900 border border-white/5 rounded-2xl p-2 focus-within:border-primary/50 transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask, calculate profit, or type: 'Import: Rose Tongue 2x 700...'"
              className="flex-1 bg-transparent text-white placeholder-zinc-500 text-xs px-3 focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      </div>

      {/* Column 2: Import & Operations Panel */}
      <div className={`w-full lg:w-[450px] bg-zinc-950 border border-white/5 rounded-[2rem] p-6 h-full flex flex-col overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-zinc-800 ${
        mobileTab === 'import' ? 'flex' : 'hidden lg:flex'
      }`}>
        
        {/* Upload & Raw Text Parse Zone */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-primary" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Smart Import Tool</h3>
          </div>
          
          <div className="space-y-3">
            <textarea
              value={rawLogs}
              onChange={(e) => setRawLogs(e.target.value)}
              placeholder="Paste raw log lines or WhatsApp sales reports...&#10;Example:&#10;2026-08-01 Rose Sucker 2x GH₵700 WhatsApp&#10;AV Wand Vibrator 1x GH₵450 Walk-in"
              className="w-full h-32 px-4 py-3 bg-zinc-900 border border-white/5 rounded-2xl text-[11px] text-white placeholder-zinc-600 focus:outline-none focus:border-primary/50 resize-none font-mono"
            />
            <button
              onClick={handleRawTextParse}
              disabled={!rawLogs.trim() || isImportingLogs}
              className="w-full py-3 bg-primary hover:bg-primary/80 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Play size={12} /> {isImportingLogs ? 'Parsing with Gemini...' : 'Parse & Extract'}
            </button>
          </div>

          {/* OCR Drag and Drop mockup zone */}
          <div className="border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-colors bg-white/[0.01]">
            <Upload size={24} className="text-zinc-600 mb-2" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Drag Receipts or CSV Here</span>
            <span className="text-[9px] text-zinc-500 mt-1">Mockup Zone - Ready for future OCR features</span>
          </div>
        </div>

        {/* Dynamic Import Preview Form & Table */}
        {showPreview && parsedSales.length > 0 && (
          <div className="border border-white/10 rounded-2xl p-4 bg-zinc-900/40 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-yellow-400 animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Reconciliation Preview</span>
              </div>
              <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                {parsedSales.length} Transactions
              </span>
            </div>

            {/* Warnings Alert */}
            {warnings.length > 0 && (
              <div className="p-3 bg-yellow-400/5 border border-yellow-400/10 rounded-xl space-y-1">
                <span className="text-[9px] font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertOctagon size={10} /> Warnings detected
                </span>
                <ul className="text-[9px] text-zinc-400 list-disc pl-3.5 space-y-0.5">
                  {warnings.map((w, idx) => <li key={idx}>{w}</li>)}
                </ul>
              </div>
            )}

            {/* Table Rows (Form fields) */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {parsedSales.map((item, idx) => (
                <div key={idx} className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2 relative group">
                  <button 
                    onClick={() => handleRemoveRow(idx)}
                    className="absolute top-2 right-2 text-zinc-600 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <Trash2 size={12} />
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Date */}
                    <div>
                      <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Date</label>
                      <input 
                        type="date"
                        value={item.date}
                        onChange={(e) => handleFieldChange(idx, 'date', e.target.value)}
                        className="w-full px-2 py-1 bg-zinc-900 border border-white/5 rounded text-[10px] text-white focus:outline-none"
                      />
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Qty</label>
                      <input 
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleFieldChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full px-2 py-1 bg-zinc-900 border border-white/5 rounded text-[10px] text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Product Matching Dropdown */}
                  <div>
                    <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Matched Product</label>
                    <select
                      value={item.productId || ''}
                      onChange={(e) => handleFieldChange(idx, 'productId', e.target.value)}
                      className="w-full px-2 py-1 bg-zinc-900 border border-white/5 rounded text-[10px] text-zinc-300 focus:outline-none"
                    >
                      <option value="">Unmatched (Messy / Custom Product)</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (GH₵{p.price})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Selling Price */}
                    <div>
                      <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Price</label>
                      <input 
                        type="number"
                        value={item.price}
                        onChange={(e) => handleFieldChange(idx, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 bg-zinc-900 border border-white/5 rounded text-[10px] text-white focus:outline-none"
                      />
                    </div>

                    {/* Discount */}
                    <div>
                      <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Discount</label>
                      <input 
                        type="number"
                        value={item.discount}
                        onChange={(e) => handleFieldChange(idx, 'discount', parseFloat(e.target.value) || 0)}
                        className="w-full px-1.5 py-1 bg-zinc-900 border border-white/5 rounded text-[10px] text-white focus:outline-none"
                      />
                    </div>

                    {/* Platform */}
                    <div>
                      <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block mb-0.5">Platform</label>
                      <select
                        value={item.platform}
                        onChange={(e) => handleFieldChange(idx, 'platform', e.target.value as any)}
                        className="w-full px-1 py-1 bg-zinc-900 border border-white/5 rounded text-[9px] text-zinc-300 focus:outline-none"
                      >
                        {['Website', 'WhatsApp', 'Instagram', 'Facebook', 'Jiji', 'Walk-in', 'Referral'].map(plat => (
                          <option key={plat} value={plat}>{plat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Commit Trigger */}
            <button
              onClick={handleCommitImport}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={12} /> Commit {parsedSales.length} Sales to DB
            </button>
          </div>
        )}

        {/* Display Skipped Rows if any */}
        {showPreview && skippedRows.length > 0 && (
          <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl space-y-2">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon size={12} /> Unrecognized Rows
            </span>
            <div className="space-y-1">
              {skippedRows.map((row, idx) => (
                <div key={idx} className="text-[9px] font-mono text-zinc-500 bg-black/20 p-2 rounded border border-white/5 truncate">
                  {row}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Import Summaries Dashboard Card */}
        {lastImportStats && (
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-emerald-500/10 pb-2">
              <CheckCircle2 size={14} className="text-emerald-400" />
              <h4 className="text-[10px] font-bold text-white uppercase tracking-widest">Last Import Summary</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 block">Total Imported</span>
                <span className="text-sm font-bold text-white font-display">{lastImportStats.importedCount} sales</span>
              </div>
              
              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 block">Stock Deductions</span>
                <span className="text-sm font-bold text-white font-display">{lastImportStats.stockUpdatedCount} items</span>
              </div>

              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 block">Revenue Added</span>
                <span className="text-sm font-bold text-emerald-400 font-display">GH₵{lastImportStats.revenue.toFixed(2)}</span>
              </div>

              <div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-500 block">Net Profit Yield</span>
                <span className="text-sm font-bold text-emerald-400 font-display">GH₵{lastImportStats.profit.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="text-[8px] text-zinc-500 border-t border-emerald-500/5 pt-2">
              Import completed in {lastImportStats.durationMs}ms.
            </div>
          </div>
        )}

        {/* Quick Database Catalog Helper */}
        <div className="p-4 bg-zinc-900/20 border border-white/5 rounded-2xl space-y-3">
          <div className="flex items-center gap-1.5">
            <HelpCircle size={12} className="text-zinc-500" />
            <span className="text-[9px] font-bold text-white uppercase tracking-wider">Quick Catalog Matcher</span>
          </div>
          <p className="text-[9.5px] text-zinc-500 leading-normal">
            To view catalog item spelling or prices, open the **Products Catalog** tab. The AI will do its best to match entries like "sucker" to "Rose Sucker Stimulator".
          </p>
        </div>

      </div>
    </div>
  );
}

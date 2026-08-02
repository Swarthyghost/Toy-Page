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
  Zap 
} from 'lucide-react';
import { marked } from 'marked';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your Retail OS Business Assistant. I have read access to your current Google Sheets inventory, Firestore sales transactions, and expense records. Ask me any questions about your sales, margins, restock status, or period reports!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const samplePrompts = [
    { text: "What was today's profit?", icon: TrendingUp },
    { text: "Which products need restocking?", icon: Package },
    { text: "What are my fastest-moving products?", icon: Zap },
    { text: "Estimate when stock will run out based on sales", icon: AlertOctagon },
  ];

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
          chatHistory: messages.slice(-10) // Send last 10 messages for context
        })
      });
      const data = await response.json();
      if (data.reply) {
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

  const renderMarkdown = (text: string) => {
    try {
      return { __html: marked.parse(text) };
    } catch (e) {
      return { __html: text };
    }
  };

  return (
    <div className="px-6 space-y-6 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="text-sm font-bold font-display text-white">AI Business Assistant</h2>
            <p className="text-[10px] text-zinc-500 mt-0.5">Real-time analytical summaries powered by Gemini.</p>
          </div>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${
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
                <p className="whitespace-pre-wrap">{msg.content}</p>
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
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-white flex-shrink-0">
              <Bot size={14} />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-zinc-900/60 border border-white/5 text-zinc-500 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
              <span>Analyzing business indexes...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts & Input */}
      <div className="mt-auto space-y-4 pb-4 flex-shrink-0">
        {messages.length === 1 && !loading && (
          <div className="grid grid-cols-2 gap-3">
            {samplePrompts.map((prompt, idx) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt.text)}
                  className="flex items-center gap-2 text-left p-3.5 bg-zinc-900 hover:bg-zinc-800/80 border border-white/5 rounded-2xl transition-all text-[11px] text-zinc-400 font-medium hover:text-white cursor-pointer"
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
            placeholder="Ask about sales, profits, stock depletion..."
            className="flex-1 bg-transparent text-white placeholder-zinc-500 text-xs px-3 focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer"
          >
            <Send size={12} />
          </button>
        </form>
      </div>
    </div>
  );
}

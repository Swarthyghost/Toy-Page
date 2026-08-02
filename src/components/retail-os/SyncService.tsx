"use client";

import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SyncService() {
  const [syncing, setSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSyncNow = async () => {
    setSyncing(true);
    setStatus('idle');
    try {
      const response = await fetch('/api/sheets-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'bulk_sync' })
      });
      const data = await response.json();
      if (data.success) {
        setStatus('success');
        setLastSynced(new Date().toLocaleTimeString());
      } else {
        setStatus('error');
      }
    } catch (e) {
      console.error(e);
      setStatus('error');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="px-6 space-y-6 max-w-xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 mx-auto">
          <RefreshCw size={20} className={syncing ? 'animate-spin text-primary' : ''} />
        </div>
        <h2 className="text-lg font-bold font-display text-white">Google Sheets Integration</h2>
        <p className="text-zinc-500 text-xs max-w-sm mx-auto">
          Cloud Firestore remains the primary database. Synchronize your Sales, Expenses, and Products data to Google Sheets for backups and custom workflows.
        </p>
      </div>

      {/* Sync Control Card */}
      <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 text-center space-y-6 shadow-xl">
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Backup Database State</span>
          <div className="flex items-center justify-center gap-2">
            {status === 'success' && <CheckCircle2 size={16} className="text-emerald-400" />}
            {status === 'error' && <AlertCircle size={16} className="text-rose-400" />}
            <span className="text-xs font-semibold text-zinc-300">
              {status === 'success' 
                ? `Sync Completed at ${lastSynced}` 
                : status === 'error' 
                  ? 'Failed to complete synchronization' 
                  : 'Ready for synchronization'}
            </span>
          </div>
        </div>

        <button
          onClick={handleSyncNow}
          disabled={syncing}
          className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:scale-[1.01] active:scale-98 transition-all disabled:opacity-50 cursor-pointer text-xs shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Synchronizing Tables...' : 'Sync Now'}</span>
        </button>
      </div>

      {/* Sheets Mapping Overview */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Synchronized Data Models</h4>
        <div className="space-y-2 text-xs">
          {[
            { model: "Products", target: "Sheet Tab: 'Products'", desc: "Syncs catalog values, pricing profiles, and stocks." },
            { model: "Sales Ledger", target: "Sheet Tab: 'Sales'", desc: "Syncs transaction amounts, profit records, and dates." },
            { model: "Expenses Outlays", target: "Sheet Tab: 'Expenses'", desc: "Syncs spend values, categories, and audit descriptors." },
            { model: "Inventory Logs", target: "Sheet Tab: 'InventoryLogs'", desc: "Syncs transaction stock traces and adjustment reasons." },
          ].map((item, idx) => (
            <div key={idx} className="flex justify-between items-start border-b border-white/5 pb-2 last:border-0 last:pb-0">
              <div>
                <span className="font-bold text-zinc-300 block">{item.model}</span>
                <span className="text-[10px] text-zinc-500">{item.desc}</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                {item.target}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

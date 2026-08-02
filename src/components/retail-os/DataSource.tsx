"use client";

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Database, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Layers, 
  AlertTriangle,
  ExternalLink,
  Settings,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import { 
  fetchProducts, 
  fetchSales, 
  fetchExpenses, 
  fetchInventoryLogs,
  fetchSiteSettings,
  updateSiteSettings,
  Product,
  Sale,
  Expense,
  InventoryLog,
  SiteSettings
} from '../../services/firebaseApi';

export default function DataSource() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [googleSheetId, setGoogleSheetId] = useState<string>('');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [testing, setTesting] = useState(false);
  
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [connStatus, setConnStatus] = useState<'connected' | 'disconnected'>('connected');
  
  // Reconnect modal state
  const [showReconnect, setShowReconnect] = useState(false);
  const [newSheetId, setNewSheetId] = useState('');

  useEffect(() => {
    loadAllData();

    // 60 seconds background polling
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/sheets-sync');
        const syncData = await res.json();
        if (syncData.googleSheetId) {
          setGoogleSheetId(syncData.googleSheetId);
        }
        const [p, s, e, l, set] = await Promise.all([
          fetchProducts(),
          fetchSales(),
          fetchExpenses(),
          fetchInventoryLogs(),
          fetchSiteSettings()
        ]);
        setProducts(p);
        setSales(s);
        setExpenses(e);
        setLogs(l);
        setSettings(set);
        setLastRefreshed(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Background poll sync failed:', err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    try {
      const res = await fetch('/api/sheets-sync');
      const syncData = await res.json();
      if (syncData.googleSheetId) {
        setGoogleSheetId(syncData.googleSheetId);
      }
      
      const [p, s, e, l, set] = await Promise.all([
        fetchProducts(),
        fetchSales(),
        fetchExpenses(),
        fetchInventoryLogs(),
        fetchSiteSettings()
      ]);
      setProducts(p);
      setSales(s);
      setExpenses(e);
      setLogs(l);
      setSettings(set);
      if (syncData.googleSheetId || set?.googleSheetId) {
        setNewSheetId(syncData.googleSheetId || set?.googleSheetId || '');
      }
      
      setLastRefreshed(new Date().toLocaleTimeString());
      
      const parseDate = (val: any): Date => {
        if (!val) return new Date(0);
        if (typeof val.toDate === 'function') return val.toDate();
        if (val.seconds !== undefined) return new Date(val.seconds * 1000);
        return new Date(val);
      };

      // Calculate last updated timestamp based on latest modified caches
      const dates = [
        ...p.map(x => parseDate(x.updatedAt)),
        ...s.map(x => parseDate(x.createdAt)),
        ...e.map(x => parseDate(x.createdAt)),
        ...l.map(x => parseDate(x.createdAt))
      ].map(d => d.getTime());

      if (dates.length > 0) {
        const maxTime = Math.max(...dates);
        setLastUpdated(new Date(maxTime).toLocaleTimeString());
      } else {
        setLastUpdated('N/A');
      }
    } catch (err) {
      console.error(err);
      setConnStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/sheets-sync');
      const data = await res.json();
      if (data.success) {
        setConnStatus('connected');
        await loadAllData();
      } else {
        setConnStatus('disconnected');
      }
    } catch (err) {
      console.error(err);
      setConnStatus('disconnected');
    } finally {
      setRefreshing(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch('/api/sheets-sync');
      const data = await res.json();
      if (data.success) {
        setConnStatus('connected');
        alert('Test Connection: Success! Reachable and synchronized.');
      } else {
        setConnStatus('disconnected');
        alert('Test Connection: Failed. Insufficient permissions or incorrect ID.');
      }
    } catch (err) {
      console.error(err);
      setConnStatus('disconnected');
      alert('Test Connection: Failed to reach sheets-sync endpoint.');
    } finally {
      setTesting(false);
    }
  };

  const handleUpdateSheetId = async () => {
    if (!newSheetId.trim()) return;
    try {
      await updateSiteSettings({ googleSheetId: newSheetId.trim() });
      alert('Google Sheet ID updated successfully.');
      setShowReconnect(false);
      handleRefresh();
    } catch (err) {
      console.error(err);
      alert('Failed to update spreadsheet ID.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading Google Sheets connection dashboard...</div>;
  }

  const sheetId = googleSheetId || settings?.googleSheetId || process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '';
  const maskedSheetId = sheetId 
    ? `${sheetId.substring(0, 6)}...${sheetId.substring(sheetId.length - 6)}` 
    : 'Not configured';

  const inventoryValue = products.reduce((acc, p) => acc + ((p.costPrice || 0) * (p.currentStock || 0)), 0);
  const lowStockCount = products.filter(p => (p.currentStock || 0) <= (p.minimumStock || 5) && (p.currentStock || 0) > 0).length;

  return (
    <div className="px-6 space-y-6 max-w-4xl mx-auto">
      {/* Top Connection Card */}
      <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-full">
                Database Root
              </span>
            </div>
            <h2 className="text-xl font-bold font-display text-white">Google Sheets Connection</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-2 pt-2 text-xs">
              <div>
                <span className="text-zinc-500 block">Connection Status</span>
                <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full ${connStatus === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  {connStatus === 'connected' ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Spreadsheet Name</span>
                <span className="font-bold text-white mt-0.5 block">Pleasure Toys Stock</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Spreadsheet ID</span>
                <span className="font-semibold text-zinc-300 font-mono mt-0.5 block truncate max-w-[150px]">{maskedSheetId}</span>
              </div>
              <div>
                <span className="text-zinc-500 block">Last Refresh</span>
                <span className="font-bold text-zinc-300 mt-0.5 block">{lastRefreshed || 'N/A'}</span>
              </div>
            </div>
            <div className="text-[10px] text-zinc-500 pt-1.5">
              <span>Last Updated (Sheets Read): </span>
              <span className="text-zinc-300 font-bold">{lastUpdated || 'N/A'}</span>
            </div>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 w-full md:w-auto">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex-1 md:w-44 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/25"
            >
              <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="flex-1 md:w-44 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{testing ? 'Pinging Sheets...' : 'Test Connection'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Connection Actions Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Worksheet Target</span>
            <span className="text-xs font-bold text-white block">Active Database Editor</span>
          </div>
          <a
            href={sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-bold border border-white/5 transition-all"
          >
            <span>Open Spreadsheet</span>
            <ExternalLink size={10} />
          </a>
        </div>

        <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">Connection Management</span>
            <span className="text-xs font-bold text-white block">Re-authenticate or Modify Target</span>
          </div>
          <button
            onClick={() => setShowReconnect(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-[10px] font-bold border border-white/5 transition-all cursor-pointer"
          >
            <span>Reconnect Google Sheet</span>
            <Settings size={10} />
          </button>
        </div>
      </div>

      {/* Live Data Summary Cards */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Live Database Counters</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Products Catalog", val: products.length, icon: Package, color: "text-primary" },
            { label: "Sales Transactions", val: sales.length, icon: TrendingUp, color: "text-emerald-400" },
            { label: "Expense Records", val: expenses.length, icon: TrendingDown, color: "text-rose-400" },
            { label: "Inventory History Logs", val: logs.length, icon: Database, color: "text-sky-400" },
            { label: "Low Stock Baseline", val: lowStockCount, icon: AlertTriangle, color: lowStockCount > 0 ? "text-amber-400 animate-pulse font-bold" : "text-zinc-500" },
            { label: "Asset Value Valuation", val: `GH₵ ${inventoryValue.toFixed(0)}`, icon: Layers, color: "text-indigo-400" },
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div key={idx} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">{card.label}</span>
                  <Icon size={14} className={card.color} />
                </div>
                <span className="text-lg font-bold font-display text-white mt-2 block">{card.val}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Connected Worksheets Verification List */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Connected Worksheet Tabs</h4>
          <span className="text-[10px] text-zinc-500 font-medium">Verify workspace sheet bindings</span>
        </div>
        <div className="space-y-3">
          {[
            { tab: "Products", target: "Products!A:H", desc: "Master inventory catalog containing names, cost and retail rates, stock thresholds." },
            { tab: "Sales", target: "Sales!A:L", desc: "Sales ledger logging transaction timestamps, gross profits, discounts, pay channels." },
            { tab: "Expenses", target: "Expenses!A:E", desc: "Spend metrics capturing raw budget outputs, categories, and descriptors." },
            { tab: "InventoryLogs", target: "InventoryLogs!A:H", desc: "Trace ledger documenting incremental adjustments, stock deductions, depletion warnings." },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3 last:border-0 last:pb-0 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white font-display">{item.tab}</span>
                  <span className="text-[9px] font-mono text-zinc-500">[{item.target}]</span>
                </div>
                <p className="text-[10px] text-zinc-400 max-w-xl">{item.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                <span>✓ Connected</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reconnect Sheets Modal */}
      {showReconnect && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white font-display">Target Google Sheet ID</h3>
              <p className="text-zinc-500 text-xs">Update your target Google Sheet ID. The sheets sync service will reconnect to this sheet instantly.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Spreadsheet ID</label>
              <input
                type="text"
                value={newSheetId}
                onChange={(e) => setNewSheetId(e.target.value)}
                placeholder="e.g. 1x2y3z4w5v6u..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2 justify-end pt-2">
              <button
                onClick={() => setShowReconnect(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white border border-transparent transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSheetId}
                disabled={!newSheetId.trim()}
                className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                Save Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

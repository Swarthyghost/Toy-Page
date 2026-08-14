"use client";

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  Layers,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { 
  fetchProducts, 
  fetchSales, 
  fetchExpenses, 
  Product, 
  Sale, 
  Expense 
} from '../../services/firebaseApi';
import { toLocalDate } from '../../utils/dateHelper';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function Overview() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [trendPeriod, setTrendPeriod] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    setMounted(true);
    loadOverviewData();
  }, []);

  const loadOverviewData = async () => {
    try {
      const [p, s, e] = await Promise.all([
        fetchProducts(),
        fetchSales(),
        fetchExpenses()
      ]);
      setProducts(p);
      setSales(s);
      setExpenses(e);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-500">Loading overview dashboards...</div>;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Filters
  const todaySales = sales.filter(s => toLocalDate(s.createdAt) >= startOfToday);
  const todayExpenses = expenses.filter(e => toLocalDate(e.createdAt) >= startOfToday);
  const monthSales = sales.filter(s => toLocalDate(s.createdAt) >= startOfMonth);

  // Aggregated KPIs
  const todaySalesRevenue = todaySales.reduce((acc, s) => acc + (s.price * s.quantity), 0);
  const todayProfit = todaySales.reduce((acc, s) => acc + s.profit, 0);
  const todayExpensesVal = todayExpenses.reduce((acc, e) => acc + e.amount, 0);
  const ordersToday = todaySales.length;
  const productsSold = todaySales.reduce((acc, s) => acc + s.quantity, 0);

  const inventoryValue = products.reduce((acc, p) => acc + ((p.costPrice || 0) * (p.currentStock || 0)), 0);
  const lowStockCount = products.filter(p => (p.currentStock || 0) <= (p.minimumStock || 5) && (p.currentStock || 0) > 0).length;

  const monthlyRevenue = monthSales.reduce((acc, s) => acc + (s.price * s.quantity), 0);
  const monthlyProfit = monthSales.reduce((acc, s) => acc + s.profit, 0);

  // Trend mapping — buckets by day (week/month) or by month (year)
  const getTrendData = (period: 'week' | 'month' | 'year') => {
    type Bucket = { label: string; start: Date; end: Date; revenue: number; profit: number };
    const buckets: Bucket[] = [];

    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
        buckets.push({ label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), start, end, revenue: 0, profit: 0 });
      }
    } else if (period === 'month') {
      for (let i = 29; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
        buckets.push({ label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), start, end, revenue: 0, profit: 0 });
      }
    } else {
      for (let i = 11; i >= 0; i--) {
        const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
        buckets.push({ label: start.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), start, end, revenue: 0, profit: 0 });
      }
    }

    sales.forEach(s => {
      const d = toLocalDate(s.createdAt);
      const bucket = buckets.find(b => d >= b.start && d < b.end);
      if (bucket) {
        bucket.revenue += s.price * s.quantity;
        bucket.profit += s.profit;
      }
    });

    return buckets.map(({ label, revenue, profit }) => ({ date: label, revenue, profit }));
  };

  const chartData = getTrendData(trendPeriod);
  const trendPeriodLabel = trendPeriod === 'week' ? 'the last 7 days' : trendPeriod === 'month' ? 'the last 30 days' : 'the last 12 months';

  // Platform Distribution
  const platformMap: { [key: string]: number } = {
    Website: 0, WhatsApp: 0, Instagram: 0, Facebook: 0, Jiji: 0, 'Walk-in': 0, Referral: 0
  };
  sales.forEach(s => {
    if (platformMap[s.platform] !== undefined) {
      platformMap[s.platform] += s.price * s.quantity;
    }
  });
  const platformChartData = Object.entries(platformMap)
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name, value }));

  // Best Selling Products (Top 5 by qty)
  const productQtyMap: { [key: string]: { name: string; quantity: number } } = {};
  sales.forEach(s => {
    if (!productQtyMap[s.productId]) {
      productQtyMap[s.productId] = { name: s.productName, quantity: 0 };
    }
    productQtyMap[s.productId].quantity += s.quantity;
  });
  const bestSellingChartData = Object.values(productQtyMap)
    .sort((a,b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Expenses Category breakdown
  const expCatMap: { [key: string]: number } = {};
  expenses.forEach(e => {
    if (!expCatMap[e.category]) {
      expCatMap[e.category] = 0;
    }
    expCatMap[e.category] += e.amount;
  });
  const expenseChartData = Object.entries(expCatMap).map(([name, value]) => ({ name, value }));

  const COLORS = ['#EC4899', '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6', '#F43F5E', '#14B8A6'];

  return (
    <div className="px-6 space-y-8 animate-in fade-in-50 duration-200">
      {/* Top Bar with Refresh button */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-zinc-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
        <div>
          <h2 className="text-base font-bold text-white font-display">Retail OS Dashboard Overview</h2>
          <p className="text-xs text-zinc-500 mt-1">Master Inventory and Sales Ledger Dashboard.</p>
        </div>
        <button
          onClick={async () => {
            setIsRefreshing(true);
            try {
              await loadOverviewData();
            } catch (err) {
              console.error(err);
            } finally {
              setIsRefreshing(false);
            }
          }}
          disabled={isRefreshing}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl text-xs font-bold border border-white/5 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin text-primary" : ""} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Dashboard'}</span>
        </button>
      </div>

      {/* 9 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: "Today's Sales", val: `GH₵ ${todaySalesRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-400" },
          { label: "Today's Profit", val: `GH₵ ${todayProfit.toFixed(2)}`, icon: TrendingUp, color: "text-primary" },
          { label: "Today's Expenses", val: `GH₵ ${todayExpensesVal.toFixed(2)}`, icon: TrendingDown, color: "text-rose-400" },
          { label: "Orders Today", val: ordersToday, icon: ShoppingCart, color: "text-sky-400" },
          { label: "Products Sold", val: productsSold, icon: Package, color: "text-violet-400" },
          { label: "Inventory Value", val: `GH₵ ${inventoryValue.toFixed(2)}`, icon: Layers, color: "text-indigo-400" },
          { label: "Low Stock Items", val: lowStockCount, icon: AlertTriangle, color: lowStockCount > 0 ? "text-amber-400 animate-pulse font-bold" : "text-zinc-500" },
          { label: "Monthly Revenue", val: `GH₵ ${monthlyRevenue.toFixed(2)}`, icon: DollarSign, color: "text-emerald-500" },
          { label: "Monthly Profit", val: `GH₵ ${monthlyProfit.toFixed(2)}`, icon: TrendingUp, color: "text-primary" },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg hover:border-white/10 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">{kpi.label}</span>
                <Icon size={14} className={kpi.color} />
              </div>
              <span className="text-lg font-bold font-display text-white tracking-tight mt-2 block">{kpi.val}</span>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics charts */}
      {mounted && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sales & Profit trend */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 lg:col-span-2 shadow-xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white font-display">Sales & Profit Trend</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Performance values compiled over {trendPeriodLabel}.</p>
              </div>
              <div className="flex items-center gap-1 bg-black border border-white/5 rounded-xl p-1 self-start">
                {([
                  { key: 'week', label: '1W' },
                  { key: 'month', label: '1M' },
                  { key: 'year', label: '1Y' },
                ] as const).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setTrendPeriod(opt.key)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      trendPeriod === opt.key
                        ? 'bg-primary text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EC4899" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#EC4899" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                    labelStyle={{ color: '#a1a1aa', fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" name="Sales Revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#EC4899" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Platform */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Revenue by Platform</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Distribution breakdown across sales channels.</p>
            </div>
            <div className="h-44 my-4 flex items-center justify-center">
              {platformChartData.length === 0 ? (
                <span className="text-xs text-zinc-500">No platforms logged</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={platformChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {platformChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '11px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-[9px]">
              {platformChartData.map((plat, idx) => (
                <div key={plat.name} className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-zinc-400 truncate">{plat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Row: Best Selling Products & Expense breakdown */}
      {mounted && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Best Selling Products */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Best Selling Products</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Top performing products by units sold.</p>
            </div>
            <div className="h-60 mt-6">
              {bestSellingChartData.length === 0 ? (
                <div className="text-center py-20 text-xs text-zinc-500">No sales logged</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bestSellingChartData} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                    <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} width={80} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '11px' }}
                    />
                    <Bar dataKey="quantity" name="Units Sold" fill="#10B981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-display">Expense Breakdown</h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">Outlays category division segments.</p>
            </div>
            <div className="h-44 my-4 flex items-center justify-center">
              {expenseChartData.length === 0 ? (
                <span className="text-xs text-zinc-500">No expenses logged</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {expenseChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '11px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-[9px]">
              {expenseChartData.map((exp, idx) => (
                <div key={exp.name} className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-zinc-400 truncate">{exp.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Layers, 
  DollarSign, 
  Award,
  ShoppingCart
} from 'lucide-react';
import { 
  fetchProducts, 
  fetchSales, 
  fetchExpenses, 
  Product, 
  Sale, 
  Expense 
} from '../../services/firebaseApi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export default function Analytics() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
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
    return <div className="p-8 text-center text-zinc-500">Loading analytics insights...</div>;
  }

  // Core Math Calculations
  const totalRevenue = sales.reduce((acc, s) => acc + (s.price * s.quantity), 0);
  const totalCOGS = sales.reduce((acc, s) => acc + (s.costPrice * s.quantity), 0);
  const totalDiscount = sales.reduce((acc, s) => acc + (s.discount || 0), 0);
  const grossProfit = totalRevenue - totalCOGS - totalDiscount;

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const aov = sales.length > 0 ? totalRevenue / sales.length : 0;
  const inventoryValue = products.reduce((acc, p) => acc + ((p.costPrice || 0) * (p.currentStock || 0)), 0);

  // Categories Mapping (Revenue by category)
  const categoryRevMap: { [key: string]: number } = {};
  sales.forEach(s => {
    const prod = products.find(p => p.id === s.productId);
    const cat = prod?.category || 'Others';
    categoryRevMap[cat] = (categoryRevMap[cat] || 0) + (s.price * s.quantity);
  });

  const sortedCategories = Object.entries(categoryRevMap).sort((a,b) => b[1] - a[1]);
  const bestCategory = sortedCategories[0]?.[0] || 'N/A';
  const worstCategory = sortedCategories[sortedCategories.length - 1]?.[0] || 'N/A';

  // Products Profits (Most profitable product)
  const productProfitMap: { [key: string]: { name: string; profit: number } } = {};
  sales.forEach(s => {
    if (!productProfitMap[s.productId]) {
      productProfitMap[s.productId] = { name: s.productName, profit: 0 };
    }
    productProfitMap[s.productId].profit += s.profit;
  });

  const sortedProductProfits = Object.values(productProfitMap).sort((a,b) => b.profit - a.profit);
  const mostProfitableProduct = sortedProductProfits[0]?.name || 'N/A';

  // Platform profits (Most profitable platform)
  const platformProfitMap: { [key: string]: number } = {};
  sales.forEach(s => {
    platformProfitMap[s.platform] = (platformProfitMap[s.platform] || 0) + s.profit;
  });
  const sortedPlatformProfits = Object.entries(platformProfitMap).sort((a,b) => b[1] - a[1]);
  const mostProfitablePlatform = sortedPlatformProfits[0]?.[0] || 'N/A';

  // Top / Least Selling Products (by quantity)
  const productQtyMap: { [key: string]: { name: string; quantity: number } } = {};
  sales.forEach(s => {
    if (!productQtyMap[s.productId]) {
      productQtyMap[s.productId] = { name: s.productName, quantity: 0 };
    }
    productQtyMap[s.productId].quantity += s.quantity;
  });
  const sortedProductQtys = Object.values(productQtyMap).sort((a,b) => b.quantity - a.quantity);
  const topProducts = sortedProductQtys.slice(0, 5);
  const leastProducts = [...sortedProductQtys].reverse().slice(0, 5);

  // Revenue by Month (Last 6 months)
  const monthlyRevenueMap: { [key: string]: number } = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    monthlyRevenueMap[key] = 0;
  }

  sales.forEach(s => {
    const dateStr = s.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (monthlyRevenueMap[dateStr] !== undefined) {
      monthlyRevenueMap[dateStr] += s.price * s.quantity;
    }
  });

  const monthChartData = Object.entries(monthlyRevenueMap).map(([name, value]) => ({ name, value }));

  // Expense categories mapping
  const expenseCatMap: { [key: string]: number } = {};
  expenses.forEach(e => {
    expenseCatMap[e.category] = (expenseCatMap[e.category] || 0) + e.amount;
  });
  const expenseChartData = Object.entries(expenseCatMap).map(([name, value]) => ({ name, value }));

  const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6', '#F43F5E', '#14B8A6'];

  return (
    <div className="px-6 space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Gross Profit", val: `GH₵ ${grossProfit.toFixed(2)}`, desc: "Revenue minus Product Costs", color: "text-emerald-400" },
          { label: "Net Profit", val: `GH₵ ${netProfit.toFixed(2)}`, desc: "Revenue minus COGS & Expenses", color: "text-primary" },
          { label: "Average Order Value", val: `GH₵ ${aov.toFixed(2)}`, desc: "Total Revenue / Sales count", color: "text-sky-400" },
          { label: "Total Inventory Value", val: `GH₵ ${inventoryValue.toFixed(2)}`, desc: "Valuation of assets at cost", color: "text-indigo-400" },
        ].map((m, idx) => (
          <div key={idx} className="bg-zinc-900 border border-white/5 rounded-2xl p-5 shadow-lg">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">{m.label}</span>
            <span className={`text-lg font-bold font-display tracking-tight mt-2 block ${m.color}`}>{m.val}</span>
            <span className="text-[10px] text-zinc-600 mt-1 block">{m.desc}</span>
          </div>
        ))}
      </div>

      {/* Profitable & Categories Insights */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Most Profitable Product", val: mostProfitableProduct, color: "text-white" },
          { label: "Most Profitable Channel", val: mostProfitablePlatform, color: "text-emerald-400" },
          { label: "Best Product Category", val: bestCategory, color: "text-primary" },
          { label: "Worst Product Category", val: worstCategory, color: "text-rose-400" },
        ].map((m, idx) => (
          <div key={idx} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">{m.label}</span>
            <span className={`text-xs font-bold mt-2 truncate ${m.color}`}>{m.val}</span>
          </div>
        ))}
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Month by Month Revenue */}
        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-xl">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Revenue by Month</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Month by month operational performance metrics.</p>
          </div>
          <div className="h-60 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthChartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '11px', color: '#fff' }}
                />
                <Bar dataKey="value" name="Sales Revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses Category Outlays */}
        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white font-display">Expense Category Share</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Segment share of cumulative business expenditures.</p>
          </div>
          <div className="h-44 my-4 flex items-center justify-center">
            {expenseChartData.length === 0 ? (
              <span className="text-xs text-zinc-500">No expenses recorded</span>
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

      {/* Tables: Top Selling vs Least Selling */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top 5 Products */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white font-display mb-4">Top 5 Selling Products</h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-zinc-500 text-xs py-8 text-center">No sales logged yet.</p>
            ) : (
              topProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0 text-xs">
                  <span className="font-bold text-zinc-300 truncate max-w-[200px]">{p.name}</span>
                  <span className="font-bold text-emerald-400 font-display">{p.quantity} units</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Least 5 Products */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white font-display mb-4">5 Least Selling Products</h3>
          <div className="space-y-3">
            {leastProducts.length === 0 ? (
              <p className="text-zinc-500 text-xs py-8 text-center">No sales logged yet.</p>
            ) : (
              leastProducts.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0 text-xs">
                  <span className="font-bold text-zinc-400 truncate max-w-[200px]">{p.name}</span>
                  <span className="font-bold text-rose-400 font-display">{p.quantity} units</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Layers, 
  DollarSign, 
  Award,
  ShoppingCart,
  Percent,
  Calendar,
  AlertOctagon,
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

  // Platform breakdowns
  const platforms = ['Website', 'WhatsApp', 'Instagram', 'Facebook', 'Jiji', 'Referral'];
  const platformStats = platforms.map(plat => {
    const platSales = sales.filter(s => s.platform === plat);
    const revenue = platSales.reduce((acc, s) => acc + (s.price * s.quantity), 0);
    const profit = platSales.reduce((acc, s) => acc + s.profit, 0);
    const orders = platSales.length;
    const aovVal = orders > 0 ? revenue / orders : 0;
    return { name: plat, revenue, profit, orders, aov: aovVal };
  });

  // Highest Revenue / Profit lists
  const productStatsMap: { [key: string]: { name: string; revenue: number; profit: number } } = {};
  sales.forEach(s => {
    if (!productStatsMap[s.productId]) {
      productStatsMap[s.productId] = { name: s.productName, revenue: 0, profit: 0 };
    }
    productStatsMap[s.productId].revenue += s.price * s.quantity;
    productStatsMap[s.productId].profit += s.profit;
  });

  const sortedByRevenue = Object.values(productStatsMap).sort((a,b) => b.revenue - a.revenue).slice(0, 5);
  const sortedByProfit = Object.values(productStatsMap).sort((a,b) => b.profit - a.profit).slice(0, 5);

  // Products Not Sold in 30 Days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const soldProductIdsIn30Days = new Set(
    sales
      .filter(s => s.createdAt?.toDate() >= thirtyDaysAgo)
      .map(s => s.productId)
  );
  const notSoldProducts = products
    .filter(p => !soldProductIdsIn30Days.has(p.id))
    .slice(0, 5);

  // Inventory Turnover = COGS / Inventory Value
  const inventoryTurnover = inventoryValue > 0 ? totalCOGS / inventoryValue : 0;

  // Out of Stock list
  const outOfStockProducts = products.filter(p => (p.currentStock || 0) <= 0).slice(0, 5);

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

  const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6', '#F43F5E', '#14B8A6'];

  return (
    <div className="px-6 space-y-8 animate-in fade-in-50 duration-200">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Gross Profit", val: `GH₵ ${grossProfit.toFixed(2)}`, desc: "Revenue minus Costs", color: "text-emerald-400" },
          { label: "Net Profit", val: `GH₵ ${netProfit.toFixed(2)}`, desc: "Gross minus Expenses", color: "text-primary" },
          { label: "Average Order Value", val: `GH₵ ${aov.toFixed(2)}`, desc: "Total Revenue / Sales", color: "text-sky-400" },
          { label: "Total Inventory Value", val: `GH₵ ${inventoryValue.toFixed(2)}`, desc: "Valuation of assets", color: "text-indigo-400" },
          { label: "Inventory Turnover", val: `${inventoryTurnover.toFixed(2)}x`, desc: "COGS / Inventory Value", color: "text-amber-400" },
        ].map((m, idx) => (
          <div key={idx} className="bg-zinc-900 border border-white/5 rounded-2xl p-5 shadow-lg">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">{m.label}</span>
            <span className={`text-base font-bold font-display tracking-tight mt-2 block ${m.color}`}>{m.val}</span>
            <span className="text-[9px] text-zinc-500 mt-1 block">{m.desc}</span>
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

      {/* Platform Breakdown Section */}
      <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-xl">
        <h3 className="text-sm font-bold text-white font-display mb-4">Platform Channel Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500">
                <th className="pb-3 font-bold">Platform</th>
                <th className="pb-3 font-bold text-right">Orders</th>
                <th className="pb-3 font-bold text-right">Revenue</th>
                <th className="pb-3 font-bold text-right">Net Profit</th>
                <th className="pb-3 font-bold text-right">AOV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {platformStats.map((plat) => (
                <tr key={plat.name} className="hover:bg-zinc-800/10 text-zinc-300">
                  <td className="py-3 font-bold text-white">{plat.name}</td>
                  <td className="py-3 text-right">{plat.orders}</td>
                  <td className="py-3 text-right text-emerald-400">GH₵ {plat.revenue.toFixed(2)}</td>
                  <td className="py-3 text-right text-primary">GH₵ {plat.profit.toFixed(2)}</td>
                  <td className="py-3 text-right text-sky-400">GH₵ {plat.aov.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-xl">
          <h3 className="text-sm font-bold text-white font-display mb-2">Revenue by Month</h3>
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

        <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <h3 className="text-sm font-bold text-white font-display mb-2">Expense Category Share</h3>
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

      {/* Products Leaders Tables */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Top Products */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 shadow-xl">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Top 5 Selling</h4>
          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-white/5 last:border-0">
                <span className="text-zinc-300 truncate max-w-[120px]">{p.name}</span>
                <span className="font-bold text-emerald-400">{p.quantity} units</span>
              </div>
            ))}
          </div>
        </div>

        {/* Least Products */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 shadow-xl">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">5 Least Selling</h4>
          <div className="space-y-3">
            {leastProducts.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-white/5 last:border-0">
                <span className="text-zinc-400 truncate max-w-[120px]">{p.name}</span>
                <span className="font-bold text-rose-400">{p.quantity} units</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Revenue */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 shadow-xl">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Top 5 Revenue</h4>
          <div className="space-y-3">
            {sortedByRevenue.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-white/5 last:border-0">
                <span className="text-zinc-300 truncate max-w-[100px]">{p.name}</span>
                <span className="font-bold text-sky-400">GH₵{p.revenue.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Profit */}
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 shadow-xl">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Top 5 Profit</h4>
          <div className="space-y-3">
            {sortedByProfit.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-white/5 last:border-0">
                <span className="text-zinc-300 truncate max-w-[100px]">{p.name}</span>
                <span className="font-bold text-primary">GH₵{p.profit.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warning/Depletion Status Tables */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Out of Stock */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-rose-400 mb-4">
            <AlertOctagon size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">Out of Stock Listings</h4>
          </div>
          <div className="space-y-3">
            {outOfStockProducts.length === 0 ? (
              <p className="text-zinc-500 text-xs py-4">All products currently have stock.</p>
            ) : (
              outOfStockProducts.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-white/5 last:border-0">
                  <span className="text-zinc-400 font-bold">{p.name}</span>
                  <span className="px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">OUT</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Products Not Sold in 30 Days */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-amber-400 mb-4">
            <Calendar size={16} />
            <h4 className="text-xs font-bold uppercase tracking-wider">Not Sold in 30 Days</h4>
          </div>
          <div className="space-y-3">
            {notSoldProducts.length === 0 ? (
              <p className="text-zinc-500 text-xs py-4">All products have recent sales activity.</p>
            ) : (
              notSoldProducts.map((p, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-white/5 last:border-0 text-zinc-400">
                  <span>{p.name}</span>
                  <span className="text-[10px] text-zinc-500 font-medium">Inactive</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

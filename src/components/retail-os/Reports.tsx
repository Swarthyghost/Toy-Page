"use client";

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  FileText,
  TrendingUp,
  Package,
  AlertTriangle,
  ArrowUpRight,
  DollarSign,
  PieChart,
  ShoppingBag,
  ListFilter
} from 'lucide-react';
import { 
  fetchSales, 
  fetchExpenses, 
  fetchProducts, 
  Sale, 
  Expense, 
  Product 
} from '../../services/firebaseApi';
import { toLocalDate } from '../../utils/dateHelper';

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    try {
      const [s, e, p] = await Promise.all([
        fetchSales(),
        fetchExpenses(),
        fetchProducts()
      ]);
      setSales(s);
      setExpenses(e);
      setProducts(p);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = () => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (reportType) {
      case 'daily':
        start.setHours(0,0,0,0);
        break;
      case 'weekly':
        start.setDate(now.getDate() - now.getDay());
        start.setHours(0,0,0,0);
        break;
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarterly':
        const currentMonth = now.getMonth();
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        start = new Date(now.getFullYear(), quarterStartMonth, 1);
        break;
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (startDate) start = toLocalDate(startDate);
        if (endDate) {
          end = toLocalDate(endDate);
          end.setHours(23,59,59,999);
        }
        break;
    }

    const filteredSales = sales.filter(s => {
      const dateVal = toLocalDate(s.createdAt);
      if (reportType === 'custom') {
        return dateVal >= start && dateVal <= end;
      }
      return dateVal >= start;
    });

    const filteredExpenses = expenses.filter(e => {
      const dateVal = toLocalDate(e.createdAt);
      if (reportType === 'custom') {
        return dateVal >= start && dateVal <= end;
      }
      return dateVal >= start;
    });

    return { filteredSales, filteredExpenses };
  };

  const { filteredSales, filteredExpenses } = getFilteredData();

  // Export functions
  const convertToCSV = (headers: string[], rows: any[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    return csvContent;
  };

  const downloadFile = (filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type: `${type};charset=utf-8;` });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    // 1. Sales CSV
    const salesHeaders = ['Sale ID', 'Date', 'Product', 'Quantity', 'Price (GHC)', 'Cost Price (GHC)', 'Profit (GHC)', 'Platform', 'Payment Method', 'Discount', 'Delivery Fee', 'Notes'];
    const salesRows = filteredSales.map(s => {
      const dateStr = s.createdAt ? toLocalDate(s.createdAt).toISOString() : '';
      return [
        s.id || '',
        dateStr,
        s.productName,
        s.quantity,
        s.price,
        s.costPrice,
        s.profit,
        s.platform,
        s.paymentMethod,
        s.discount || 0,
        s.deliveryFee || 0,
        s.notes || ''
      ];
    });
    const salesCSV = convertToCSV(salesHeaders, salesRows);
    downloadFile(`Sales_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`, salesCSV, 'text/csv');

    // 2. Expenses CSV
    const expHeaders = ['Expense ID', 'Date', 'Category', 'Amount (GHC)', 'Description'];
    const expRows = filteredExpenses.map(e => {
      const dateStr = e.createdAt ? toLocalDate(e.createdAt).toISOString() : '';
      return [
        e.id || '',
        dateStr,
        e.category,
        e.amount,
        e.description
      ];
    });
    const expCSV = convertToCSV(expHeaders, expRows);
    setTimeout(() => {
      downloadFile(`Expenses_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`, expCSV, 'text/csv');
    }, 300);
  };

  const handleExportExcel = () => {
    const salesHeaders = ['Sale ID', 'Date', 'Product', 'Quantity', 'Price (GHC)', 'Cost Price (GHC)', 'Profit (GHC)', 'Platform', 'Payment Method'];
    const salesRows = filteredSales.map(s => {
      const dateStr = s.createdAt ? toLocalDate(s.createdAt).toISOString() : '';
      return [s.id, dateStr, s.productName, s.quantity, s.price, s.costPrice, s.profit, s.platform, s.paymentMethod];
    });
    const salesCSV = convertToCSV(salesHeaders, salesRows);
    downloadFile(`Sales_Excel_${reportType}.xls`, salesCSV, 'application/vnd.ms-excel');
  };

  const handleExportPDF = () => {
    window.print();
  };

  // Calculations for Aggregated Stats
  const revenueTotal = filteredSales.reduce((acc, s) => acc + (s.price * s.quantity), 0);
  const costOfGoodsSold = filteredSales.reduce((acc, s) => acc + ((s.costPrice || 0) * s.quantity), 0);
  const discountsTotal = filteredSales.reduce((acc, s) => acc + (s.discount || 0), 0);
  
  // Gross Profit = Revenue - COGS - Discounts
  const grossProfit = revenueTotal - costOfGoodsSold - discountsTotal;
  const expenseTotal = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  
  // Net Profit = Gross Profit - Total Expenses
  const netProfit = grossProfit - expenseTotal;
  const grossMargin = revenueTotal > 0 ? (grossProfit / revenueTotal) * 100 : 0;
  const netMargin = revenueTotal > 0 ? (netProfit / revenueTotal) * 100 : 0;

  // Category performance calculations
  const categoryBreakdown: Record<string, { count: number; revenue: number; profit: number }> = {};
  filteredSales.forEach(s => {
    const prod = products.find(p => p.id === s.productId);
    const category = prod ? prod.category : 'Adult Products';
    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = { count: 0, revenue: 0, profit: 0 };
    }
    categoryBreakdown[category].count += s.quantity;
    categoryBreakdown[category].revenue += s.price * s.quantity;
    categoryBreakdown[category].profit += s.profit;
  });

  // Best & Least Sellers calculations
  const productPerformanceMap: Record<string, { name: string; quantity: number; revenue: number; profit: number }> = {};
  filteredSales.forEach(s => {
    const key = s.productId || s.productName;
    if (!productPerformanceMap[key]) {
      productPerformanceMap[key] = { name: s.productName, quantity: 0, revenue: 0, profit: 0 };
    }
    productPerformanceMap[key].quantity += s.quantity;
    productPerformanceMap[key].revenue += s.price * s.quantity;
    productPerformanceMap[key].profit += s.profit;
  });

  const sortedPerformance = Object.values(productPerformanceMap);
  const bestSellers = [...sortedPerformance].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const leastSellers = [...sortedPerformance].sort((a, b) => a.quantity - b.quantity).slice(0, 3);

  // Stock status checks
  const outOfStockItems = products.filter(p => (p.currentStock || 0) === 0);
  const lowStockItems = products.filter(p => (p.currentStock || 0) > 0 && (p.currentStock || 0) <= (p.minimumStock || 5));

  return (
    <div className="px-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-white">Operations Reports</h2>
        <p className="text-zinc-500 text-xs mt-0.5 font-medium">Reconcile margins, generate breakdowns, and download statements.</p>
      </div>

      {/* Interval Selector Controls */}
      <div className="bg-zinc-900 border border-white/5 rounded-3xl p-6 space-y-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Interval Frame</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-4 py-2.5 bg-black border border-white/5 rounded-xl text-xs text-zinc-400 focus:outline-none focus:border-primary"
            >
              <option value="daily">Daily Report</option>
              <option value="weekly">Weekly Report</option>
              <option value="monthly">Monthly Report</option>
              <option value="quarterly">Quarterly Report</option>
              <option value="yearly">Yearly Report</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {reportType === 'custom' && (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Start Date</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">End Date</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-black border border-white/5 rounded-xl text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>
            </>
          )}

          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
            <button
              onClick={handleExportCSV}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-zinc-700 cursor-pointer transition-all border border-white/5"
            >
              <Download size={12} />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-zinc-700 cursor-pointer transition-all border border-white/5"
            >
              <FileText size={12} />
              <span>Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-zinc-700 cursor-pointer transition-all border border-white/5"
            >
              <Download size={12} />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Aggregated Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-6 border-t border-white/5">
          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <span className="text-[8px] uppercase font-bold tracking-wider text-zinc-500 block">Total Revenue</span>
            <span className="text-sm font-bold font-display text-emerald-400 mt-1 block">GH₵ {revenueTotal.toFixed(2)}</span>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <span className="text-[8px] uppercase font-bold tracking-wider text-zinc-500 block">Cost of Sales</span>
            <span className="text-sm font-bold font-display text-white/70 mt-1 block">GH₵ {costOfGoodsSold.toFixed(2)}</span>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <span className="text-[8px] uppercase font-bold tracking-wider text-zinc-500 block">Gross Profit</span>
            <span className="text-sm font-bold font-display text-emerald-400 mt-1 block">GH₵ {grossProfit.toFixed(2)}</span>
            <span className="text-[8.5px] text-zinc-500 mt-0.5 block">Margin: {grossMargin.toFixed(1)}%</span>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <span className="text-[8px] uppercase font-bold tracking-wider text-zinc-500 block">Total Spend</span>
            <span className="text-sm font-bold font-display text-rose-400 mt-1 block">GH₵ {expenseTotal.toFixed(2)}</span>
          </div>

          <div className="bg-black/40 border border-white/5 p-4 rounded-2xl">
            <span className="text-[8px] uppercase font-bold tracking-wider text-zinc-500 block">Net Income</span>
            <span className="text-sm font-bold font-display text-primary mt-1 block">GH₵ {netProfit.toFixed(2)}</span>
            <span className="text-[8.5px] text-zinc-500 mt-0.5 block">Net Margin: {netMargin.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Category Performance */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <PieChart size={16} className="text-primary" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Category Revenues & Margins</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-zinc-500 font-bold uppercase tracking-wider text-[8.5px] border-b border-white/5">
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-right">Items Sold</th>
                  <th className="pb-2 text-right">Revenue (GH₵)</th>
                  <th className="pb-2 text-right">Profit (GH₵)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.keys(categoryBreakdown).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-zinc-500">No sales logged in this period.</td>
                  </tr>
                ) : (
                  Object.entries(categoryBreakdown).map(([cat, val]) => (
                    <tr key={cat} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-2.5 font-bold text-white">{cat}</td>
                      <td className="py-2.5 text-right text-zinc-400">{val.count}</td>
                      <td className="py-2.5 text-right font-display text-white">{val.revenue.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-display text-emerald-400 font-semibold">{val.profit.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Rankings (Best & Least) */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <ShoppingBag size={16} className="text-primary" />
            <h3 className="text-xs font-bold text-white uppercase tracking-widest">Product Performance Rankings</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Top Sellers */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">Best Sellers (Qty)</span>
              {bestSellers.length === 0 ? (
                <span className="text-[10px] text-zinc-500">No records</span>
              ) : (
                <div className="space-y-1.5">
                  {bestSellers.map((prod, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-black/20 border border-white/5 p-2 rounded-xl text-[10.5px]">
                      <span className="text-white font-medium truncate max-w-[100px]">{prod.name}</span>
                      <span className="font-bold text-emerald-400 font-display">{prod.quantity} units</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Least Sellers */}
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider block">Least Sellers (Qty)</span>
              {leastSellers.length === 0 ? (
                <span className="text-[10px] text-zinc-500">No records</span>
              ) : (
                <div className="space-y-1.5">
                  {leastSellers.map((prod, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-black/20 border border-white/5 p-2 rounded-xl text-[10.5px]">
                      <span className="text-white/80 truncate max-w-[100px]">{prod.name}</span>
                      <span className="font-bold text-zinc-400 font-display">{prod.quantity} units</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stock Levels Status Card */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <AlertTriangle size={16} className="text-primary" />
          <h3 className="text-xs font-bold text-white uppercase tracking-widest">Inventory Stock Status Alerts</h3>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Out of Stock */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider block">🔴 Out of Stock ({outOfStockItems.length})</span>
            <div className="max-h-40 overflow-y-auto pr-1 space-y-1">
              {outOfStockItems.length === 0 ? (
                <div className="text-[10px] text-zinc-500 p-2 bg-black/10 rounded-xl">All products currently in stock.</div>
              ) : (
                outOfStockItems.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-2 bg-rose-500/[0.03] border border-rose-500/10 rounded-xl text-[10px]">
                    <span className="text-white/80 font-medium">{p.name}</span>
                    <span className="text-[8px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded-full font-bold">OUT</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock */}
          <div className="space-y-2">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider block">🟡 Low Stock Alert ({lowStockItems.length})</span>
            <div className="max-h-40 overflow-y-auto pr-1 space-y-1">
              {lowStockItems.length === 0 ? (
                <div className="text-[10px] text-zinc-500 p-2 bg-black/10 rounded-xl">All stock levels are safe.</div>
              ) : (
                lowStockItems.map(p => (
                  <div key={p.id} className="flex justify-between items-center p-2 bg-amber-500/[0.03] border border-amber-500/10 rounded-xl text-[10px]">
                    <span className="text-white/80 font-medium">{p.name}</span>
                    <span className="font-bold text-amber-400 font-display">{p.currentStock} left (Min: {p.minimumStock})</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

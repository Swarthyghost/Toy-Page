"use client";

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  FileText 
} from 'lucide-react';
import { 
  fetchSales, 
  fetchExpenses, 
  fetchProducts, 
  Sale, 
  Expense, 
  Product 
} from '../../services/firebaseApi';

export default function Reports() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
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
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        if (startDate) start = new Date(startDate);
        if (endDate) {
          end = new Date(endDate);
          end.setHours(23,59,59,999);
        }
        break;
    }

    const filteredSales = sales.filter(s => {
      const d = s.createdAt?.toDate();
      if (!d) return false;
      if (reportType === 'custom') {
        return d >= start && d <= end;
      }
      return d >= start;
    });

    const filteredExpenses = expenses.filter(e => {
      const d = e.createdAt?.toDate();
      if (!d) return false;
      if (reportType === 'custom') {
        return d >= start && d <= end;
      }
      return d >= start;
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
    const salesRows = filteredSales.map(s => [
      s.id || '',
      s.createdAt?.toDate().toISOString() || '',
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
    ]);
    const salesCSV = convertToCSV(salesHeaders, salesRows);
    downloadFile(`Sales_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`, salesCSV, 'text/csv');

    // 2. Expenses CSV
    const expHeaders = ['Expense ID', 'Date', 'Category', 'Amount (GHC)', 'Description'];
    const expRows = filteredExpenses.map(e => [
      e.id || '',
      e.createdAt?.toDate().toISOString() || '',
      e.category,
      e.amount,
      e.description
    ]);
    const expCSV = convertToCSV(expHeaders, expRows);
    setTimeout(() => {
      downloadFile(`Expenses_Report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`, expCSV, 'text/csv');
    }, 300);
  };

  const handleExportExcel = () => {
    // Treat as formatted XML or trigger a CSV download labeled as .xls for Excel compatibility
    const salesHeaders = ['Sale ID', 'Date', 'Product', 'Quantity', 'Price (GHC)', 'Cost Price (GHC)', 'Profit (GHC)', 'Platform', 'Payment Method'];
    const salesRows = filteredSales.map(s => [s.id, s.createdAt?.toDate().toISOString(), s.productName, s.quantity, s.price, s.costPrice, s.profit, s.platform, s.paymentMethod]);
    const salesCSV = convertToCSV(salesHeaders, salesRows);
    downloadFile(`Sales_Excel_${reportType}.xls`, salesCSV, 'application/vnd.ms-excel');
  };

  const handleExportPDF = () => {
    // Standard trigger to print window layout for PDF exports
    window.print();
  };

  // Aggregated Stats
  const revenueTotal = filteredSales.reduce((acc, s) => acc + (s.price * s.quantity), 0);
  const profitTotal = filteredSales.reduce((acc, s) => acc + s.profit, 0);
  const expenseTotal = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="px-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold font-display text-white">Reports Exporter</h2>
        <p className="text-zinc-500 text-xs mt-0.5">Generate, audit, and extract formatted data sheets.</p>
      </div>

      {/* Exporter Controls */}
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
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-zinc-700 cursor-pointer transition-colors border border-white/5"
            >
              <Download size={12} />
              <span>CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-zinc-700 cursor-pointer transition-colors border border-white/5"
            >
              <FileText size={12} />
              <span>Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-zinc-700 cursor-pointer transition-colors border border-white/5"
            >
              <Download size={12} />
              <span>PDF</span>
            </button>
          </div>
        </div>

        {/* Aggregate Preview */}
        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 text-center">
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Interval Sales Revenue</span>
            <span className="text-sm font-bold font-display text-emerald-400 mt-1 block">GH₵ {revenueTotal.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Interval Net Profit</span>
            <span className="text-sm font-bold font-display text-primary mt-1 block">GH₵ {profitTotal.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 block">Interval Spend</span>
            <span className="text-sm font-bold font-display text-rose-400 mt-1 block">GH₵ {expenseTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Preview Ledger Table */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-white font-display">Interval Transactions Preview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 uppercase tracking-wider text-[9px] font-bold">
                <th className="pb-3">Type</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Particulars</th>
                <th className="pb-3 text-right">Inflow (GH₵)</th>
                <th className="pb-3 text-right">Outflow (GH₵)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-zinc-500">Loading ledger logs...</td>
                </tr>
              ) : filteredSales.length === 0 && filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-zinc-500">No logs found in this interval.</td>
                </tr>
              ) : (
                <>
                  {filteredSales.slice(0, 10).map(s => (
                    <tr key={`s-${s.id}`} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="py-2.5 text-emerald-400 font-bold">Sale</td>
                      <td className="py-2.5 text-zinc-400">
                        {s.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-2.5 text-zinc-300 truncate max-w-[200px]">{s.productName} (x{s.quantity})</td>
                      <td className="py-2.5 text-right text-emerald-400 font-semibold">{(s.price * s.quantity).toFixed(2)}</td>
                      <td className="py-2.5 text-right text-zinc-600">-</td>
                    </tr>
                  ))}
                  {filteredExpenses.slice(0, 10).map(e => (
                    <tr key={`e-${e.id}`} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="py-2.5 text-rose-400 font-bold">Expense</td>
                      <td className="py-2.5 text-zinc-400">
                        {e.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-2.5 text-zinc-300 truncate max-w-[200px]">{e.description}</td>
                      <td className="py-2.5 text-right text-zinc-600">-</td>
                      <td className="py-2.5 text-right text-rose-400 font-semibold">{e.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

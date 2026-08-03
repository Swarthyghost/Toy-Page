"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  Search, 
  ImageIcon,
  Pencil
} from 'lucide-react';
import { 
  fetchExpenses, 
  logExpense, 
  deleteExpense, 
  updateExpense,
  Expense 
} from '../../services/firebaseApi';
import { uploadImage } from '../../config/cloudinary';

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Form State
  const [form, setForm] = useState({
    category: 'Advertising' as Expense['category'],
    amount: '',
    description: '',
    spentAt: new Date().toISOString().substring(0, 10),
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const categories = [
    'Fuel', 
    'Packaging', 
    'Delivery', 
    'Advertising', 
    'Rent', 
    'Internet', 
    'Electricity', 
    'Stock Purchase', 
    'Miscellaneous'
  ];

  useEffect(() => {
    loadExpensesData();
  }, []);

  const loadExpensesData = async () => {
    setLoading(true);
    try {
      const all = await fetchExpenses();
      setExpenses(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      setReceiptPreview(URL.createObjectURL(file));
    }
  };

  const handleEditClick = (exp: Expense) => {
    setEditingExpense(exp);
    let dateStr = new Date().toISOString().substring(0, 10);
    if (exp.createdAt) {
      const created = exp.createdAt as any;
      if (typeof created.toDate === 'function') {
        dateStr = created.toDate().toISOString().substring(0, 10);
      } else {
        dateStr = new Date(created).toISOString().substring(0, 10);
      }
    }
    setForm({
      category: exp.category,
      amount: exp.amount.toString(),
      description: exp.description,
      spentAt: dateStr,
    });
    setReceiptFile(null);
    setReceiptPreview(exp.receiptImage || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
    setForm({
      category: 'Advertising',
      amount: '',
      description: '',
      spentAt: new Date().toISOString().substring(0, 10),
    });
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description || !form.spentAt) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      let receiptUrl = receiptPreview || '';
      if (receiptFile) {
        receiptUrl = await uploadImage(receiptFile);
      }

      const payload = {
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description,
        receiptImage: receiptUrl || undefined,
        createdAt: form.spentAt,
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id!, payload);
        alert('Expense updated successfully!');
      } else {
        await logExpense(payload);
        alert('Expense logged successfully!');
      }

      handleCloseModal();
      await loadExpensesData();
    } catch (err) {
      console.error(err);
      alert(editingExpense ? 'Failed to update expense.' : 'Failed to log expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await deleteExpense(id);
      alert('Expense log deleted.');
      await loadExpensesData();
    } catch (err) {
      console.error(err);
    }
  };

  // Date boundaries
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0,0,0,0);
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Filters
  const dailyExpenses = expenses.filter(e => e.createdAt?.toDate() >= startOfToday);
  const weeklyExpenses = expenses.filter(e => e.createdAt?.toDate() >= startOfWeek);
  const monthlyExpenses = expenses.filter(e => e.createdAt?.toDate() >= startOfMonth);
  const yearlyExpenses = expenses.filter(e => e.createdAt?.toDate() >= startOfYear);

  // Aggregated totals
  const dailyTotal = dailyExpenses.reduce((acc, e) => acc + e.amount, 0);
  const weeklyTotal = weeklyExpenses.reduce((acc, e) => acc + e.amount, 0);
  const monthlyTotal = monthlyExpenses.reduce((acc, e) => acc + e.amount, 0);
  const yearlyTotal = yearlyExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Search filter
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Expenses ledger</h2>
          <p className="text-zinc-500 text-xs mt-0.5">Track daily operational spend, purchase receipts, and category aggregates.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:scale-[1.01] active:scale-98 transition-all cursor-pointer text-xs shadow-lg shadow-primary/25"
        >
          <Plus size={16} />
          <span>Log Expense</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Daily Expenses", val: `GH₵ ${dailyTotal.toFixed(2)}`, color: "text-rose-400" },
          { label: "Weekly Expenses", val: `GH₵ ${weeklyTotal.toFixed(2)}`, color: "text-rose-500" },
          { label: "Monthly Expenses", val: `GH₵ ${monthlyTotal.toFixed(2)}`, color: "text-pink-400" },
          { label: "Yearly Expenses", val: `GH₵ ${yearlyTotal.toFixed(2)}`, color: "text-red-400" },
        ].map((kpi, idx) => (
          <div key={idx} className="bg-zinc-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500">{kpi.label}</span>
            <span className={`text-lg font-bold font-display tracking-tight mt-2 block ${kpi.color}`}>{kpi.val}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="relative sm:col-span-2">
          <Search size={16} className="absolute left-3.5 top-3 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search by description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary text-xs text-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-zinc-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary text-xs text-zinc-400"
        >
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Expenses Ledger */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 uppercase tracking-wider text-[9px] font-bold">
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4">Receipt</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-zinc-500">Loading expense logs...</td>
                </tr>
              ) : filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-zinc-500">No expenses recorded matching filters.</td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                    <td className="p-4 text-zinc-400 whitespace-nowrap">
                      {exp.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4 font-bold text-white/90">{exp.description}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-300 border border-white/5">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-right text-rose-400 font-semibold">GH₵ {exp.amount.toFixed(2)}</td>
                    <td className="p-4">
                      {exp.receiptImage ? (
                        <a 
                          href={exp.receiptImage} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline cursor-pointer"
                        >
                          <ImageIcon size={10} />
                          <span>View Doc</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-zinc-600">No Image</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={() => handleEditClick(exp)}
                          className="p-1.5 rounded-lg border border-white/5 hover:bg-primary/10 text-zinc-400 hover:text-primary transition-colors cursor-pointer"
                          title="Edit Expense"
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(exp.id!)}
                          className="p-1.5 rounded-lg border border-white/5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Expense"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={handleCloseModal}
              className="absolute right-6 top-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold font-display text-white mb-6">
              {editingExpense ? 'Edit Expense Record' : 'Log Business Expense'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Receipt File Upload */}
              <div className="flex items-center gap-4 p-4 bg-black/20 border border-white/5 rounded-xl">
                <div className="w-14 h-14 rounded-lg overflow-hidden border border-white/10 bg-black flex items-center justify-center flex-shrink-0">
                  {receiptPreview ? (
                    <img src={receiptPreview} alt="Receipt Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={20} className="text-zinc-700" />
                  )}
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-white block">Receipt Image Attachment (Optional)</span>
                  <label className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold rounded cursor-pointer transition-colors border border-white/5">
                    <Upload size={10} />
                    <span>Upload Image</span>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as any })}
                  className="w-full px-4 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-zinc-400"
                  required
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Description</label>
                <input 
                  type="text"
                  placeholder="e.g. MTN Ads Campaign"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Amount (GH₵)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Date Spent</label>
                  <input 
                    type="date"
                    value={form.spentAt}
                    onChange={(e) => setForm({ ...form, spentAt: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : editingExpense ? 'Save Changes' : 'Submit Outlay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

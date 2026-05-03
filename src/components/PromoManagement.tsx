import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Tag, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import { fetchPromoCodes, createPromoCode, updatePromoCode, deletePromoCode, PromoCode } from '../services/firebaseApi';

export default function PromoManagement() {
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    type: 'percentage' as 'percentage' | 'fixed',
    minAmount: '',
    maxUses: '',
    isActive: true,
    expiresAt: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPromos();
  }, []);

  const loadPromos = async () => {
    const data = await fetchPromoCodes();
    setPromos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Ensure expiresAt is either a valid date or undefined
      let expiryDate = undefined;
      if (formData.expiresAt) {
        expiryDate = new Date(formData.expiresAt);
        if (isNaN(expiryDate.getTime())) {
          throw new Error('Invalid expiry date');
        }
      }

      const payload = {
        code: formData.code.toUpperCase().trim(),
        discount: parseFloat(formData.discount),
        type: formData.type,
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : undefined,
        isActive: formData.isActive,
        expiresAt: expiryDate,
      };

      if (editingPromo) {
        await updatePromoCode(editingPromo.id, payload);
      } else {
        await createPromoCode(payload);
      }

      setIsModalOpen(false);
      setEditingPromo(null);
      setFormData({
        code: '',
        discount: '',
        type: 'percentage',
        minAmount: '',
        maxUses: '',
        isActive: true,
        expiresAt: '',
      });
      loadPromos();
    } catch (error) {
      console.error('Error saving promo code:', error);
      alert(`Failed to save promo code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      discount: promo.discount.toString(),
      type: promo.type,
      minAmount: promo.minAmount?.toString() || '',
      maxUses: promo.maxUses?.toString() || '',
      isActive: promo.isActive,
      expiresAt: promo.expiresAt ? promo.expiresAt.toDate().toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this promo code?')) {
      await deletePromoCode(id);
      loadPromos();
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'No expiry';
    return timestamp.toDate().toLocaleDateString();
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-5xl font-display font-bold mb-4">Promo Codes</h1>
          <p className="text-white/40">Manage discount codes and promotions.</p>
        </div>
        <button
          onClick={() => {
            setEditingPromo(null);
            setFormData({
              code: '',
              discount: '',
              type: 'percentage',
              minAmount: '',
              maxUses: '',
              isActive: true,
              expiresAt: '',
            });
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-primary text-white font-bold rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus size={20} />
          Add Promo
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Code</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Discount</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Type</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Usage</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Status</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.map((promo) => (
              <tr key={promo.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <Tag size={18} className="text-primary" />
                    <span className="font-mono font-bold text-lg">{promo.code}</span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2">
                    {promo.type === 'percentage' ? <Percent size={16} /> : <DollarSign size={16} />}
                    <span className="font-display font-bold">
                      {promo.type === 'percentage' ? `${promo.discount}%` : `GHS ${promo.discount}`}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">
                    {promo.type}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Users size={16} />
                    {promo.currentUses}
                    {promo.maxUses && ` / ${promo.maxUses}`}
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex flex-col gap-1">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      promo.isActive ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="text-xs text-white/40">
                      {formatDate(promo.expiresAt)}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(promo)}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-primary transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <h2 className="text-4xl font-display font-bold mb-8">
                {editingPromo ? 'Edit Promo Code' : 'Add New Promo Code'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <Tag size={14} /> Promo Code
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors font-mono"
                      placeholder="SAVE20"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <Percent size={14} /> Discount Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'percentage' | 'fixed' })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors appearance-none"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (GHS)</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      {formData.type === 'percentage' ? <Percent size={14} /> : <DollarSign size={14} />}
                      Discount {formData.type === 'percentage' ? '(%)' : '(GHS)'}
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="0"
                      max={formData.type === 'percentage' ? '100' : undefined}
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                      placeholder={formData.type === 'percentage' ? '20' : '50'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <DollarSign size={14} /> Minimum Amount (GHS)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <Users size={14} /> Max Uses
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxUses}
                      onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <Calendar size={14} /> Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <label htmlFor="isActive" className="text-white/80">
                    Active (customers can use this promo code)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-5 bg-primary text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {editingPromo ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingPromo ? 'Update Promo Code' : 'Create Promo Code'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

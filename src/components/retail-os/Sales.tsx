"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Search, 
  X, 
  Trash2, 
  Calendar,
  DollarSign,
  TrendingUp,
  Tag,
  Pencil
} from 'lucide-react';
import { 
  fetchSales, 
  logSale, 
  deleteSale, 
  updateSale,
  Sale, 
  fetchProducts, 
  Product 
} from '../../services/firebaseApi';

const saleFormSchema = z.object({
  productId: z.string().min(1, 'Please select a product'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be 1 or more'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  costPrice: z.coerce.number().min(0, 'Cost price must be positive'),
  platform: z.enum(['Website', 'WhatsApp', 'Instagram', 'Facebook', 'Jiji', 'Walk-in', 'Referral']),
  paymentMethod: z.enum(['Cash', 'MoMo', 'Card', 'Bank Transfer']),
  discount: z.coerce.number().min(0, 'Discount must be positive').default(0),
  soldAt: z.string().min(1, 'Please select the date sold'),
  notes: z.string().optional(),
});

type SaleFormData = z.infer<typeof saleFormSchema>;

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(saleFormSchema),
    defaultValues: {
      productId: '',
      quantity: 1,
      price: 0,
      costPrice: 0,
      platform: 'Website' as const,
      paymentMethod: 'MoMo' as const,
      discount: 0,
      soldAt: new Date().toISOString().substring(0, 10),
      notes: '',
    }
  });

  const selectedProductId = watch('productId');

  useEffect(() => {
    loadSalesData();
  }, []);

  useEffect(() => {
    if (selectedProductId && !editingSale) {
      const prod = products.find(p => p.id === selectedProductId);
      if (prod) {
        setValue('price', prod.price);
        setValue('costPrice', prod.costPrice || 0);
      }
    }
  }, [selectedProductId, products, setValue, editingSale]);

  const loadSalesData = async () => {
    setLoading(true);
    try {
      const [salesList, prods] = await Promise.all([
        fetchSales(),
        fetchProducts()
      ]);
      setSales(salesList);
      setProducts(prods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (sale: Sale) => {
    setEditingSale(sale);
    setValue('productId', sale.productId);
    setValue('quantity', sale.quantity);
    setValue('price', sale.price);
    setValue('costPrice', sale.costPrice || 0);
    setValue('platform', sale.platform);
    setValue('paymentMethod', sale.paymentMethod);
    setValue('discount', sale.discount || 0);
    
    let dateStr = new Date().toISOString().substring(0, 10);
    if (sale.createdAt) {
      const created = sale.createdAt as any;
      if (typeof created.toDate === 'function') {
        dateStr = created.toDate().toISOString().substring(0, 10);
      } else {
        dateStr = new Date(created).toISOString().substring(0, 10);
      }
    }
    setValue('soldAt', dateStr);
    setValue('notes', sale.notes || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSale(null);
    reset();
  };

  const onSubmit = async (values: any) => {
    const data = values as SaleFormData;
    setIsSubmitting(true);
    try {
      const prod = products.find(p => p.id === data.productId);
      if (!prod) return;

      if (!editingSale && prod.currentStock !== undefined && prod.currentStock < data.quantity) {
        if (!confirm(`Warning: Only ${prod.currentStock} items in stock. Proceed?`)) {
          setIsSubmitting(false);
          return;
        }
      }

      const costPrice = data.costPrice !== undefined ? data.costPrice : (prod.costPrice || 0);
      const revenue = data.price * data.quantity;
      const profit = revenue - (costPrice * data.quantity) - data.discount;

      const payload = {
        productId: data.productId,
        productName: prod.name,
        quantity: data.quantity,
        price: data.price,
        costPrice,
        profit,
        platform: data.platform,
        paymentMethod: data.paymentMethod,
        discount: data.discount,
        deliveryFee: 0,
        notes: data.notes || '',
        createdAt: data.soldAt,
      };

      console.log("Saving Sale Payload:", {
        saleId: editingSale?.id || 'new',
        productName: prod.name,
        quantity: data.quantity,
        sellingPrice: data.price,
        costPrice,
        profit,
        platform: data.platform,
        paymentMethod: data.paymentMethod,
        notes: data.notes || '',
        date: data.soldAt,
        time: new Date().toLocaleTimeString(),
      });

      if (editingSale) {
        await updateSale(editingSale.id!, payload);
        alert('Sale record updated and inventory reconciled successfully!');
      } else {
        await logSale(payload);
        alert('Sale logged and inventory adjusted successfully!');
      }

      handleCloseModal();
      await loadSalesData();
    } catch (err: any) {
      console.error("Failed to save sale record:", err);
      const msg = err.message || 'An unexpected database error occurred.';
      alert(editingSale ? `Error updating sale: ${msg}` : `Error logging sale: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sale record?')) return;
    try {
      await deleteSale(id);
      alert('Sale deleted.');
      await loadSalesData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredSales = sales.filter(s => {
    const matchesSearch = s.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlatform = platformFilter === 'All' || s.platform === platformFilter;
    return matchesSearch && matchesPlatform;
  });

  return (
    <div className="px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold font-display text-white">Sales Ledger</h2>
          <p className="text-zinc-500 text-xs mt-0.5">Audit transaction logs, margins, and operational platforms.</p>
        </div>
        <button 
          onClick={() => {
            reset();
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl hover:scale-[1.01] active:scale-98 transition-all cursor-pointer text-xs shadow-lg shadow-primary/25"
        >
          <Plus size={16} />
          <span>Record Sale</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="relative sm:col-span-2">
          <Search size={16} className="absolute left-3.5 top-3 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary text-xs text-white"
          />
        </div>
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="px-4 py-2.5 bg-zinc-900 border border-white/5 rounded-xl focus:outline-none focus:border-primary text-xs text-zinc-400"
        >
          <option value="All">All Channels</option>
          {['Website', 'WhatsApp', 'Instagram', 'Facebook', 'Jiji', 'Walk-in', 'Referral'].map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Sales Table */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl shadow-xl overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500 uppercase tracking-wider text-[9px] font-bold">
                <th className="p-4">Date</th>
                <th className="p-4">Product Name</th>
                <th className="p-4 text-center">Qty</th>
                <th className="p-4 text-right">Selling Price</th>
                <th className="p-4 text-right">Cost Price</th>
                <th className="p-4 text-right">Net Revenue</th>
                <th className="p-4 text-right">Net Profit</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Payment</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center py-20 text-zinc-500">Loading sales records...</td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-20 text-zinc-500">No sales recorded matching criteria.</td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const revenue = (sale.price * sale.quantity) - (sale.discount || 0) + (sale.deliveryFee || 0);
                  return (
                    <tr key={sale.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 text-zinc-400 whitespace-nowrap">
                        {sale.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 font-bold text-white/90 truncate max-w-[150px]">{sale.productName}</td>
                      <td className="p-4 text-center font-semibold text-zinc-300">{sale.quantity}</td>
                      <td className="p-4 text-right text-zinc-400">GH₵ {sale.price.toFixed(2)}</td>
                      <td className="p-4 text-right text-zinc-400">GH₵ {sale.costPrice.toFixed(2)}</td>
                      <td className="p-4 text-right text-emerald-400 font-semibold">GH₵ {revenue.toFixed(2)}</td>
                      <td className="p-4 text-right text-primary font-semibold">GH₵ {sale.profit.toFixed(2)}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-zinc-800 text-zinc-300 border border-white/5">
                          {sale.platform}
                        </span>
                      </td>
                      <td className="p-4 text-zinc-400">{sale.paymentMethod}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => handleEditClick(sale)}
                            className="p-1.5 rounded-lg border border-white/5 hover:bg-primary/10 text-zinc-400 hover:text-primary transition-colors cursor-pointer"
                            title="Edit Sale"
                          >
                            <Pencil size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(sale.id!)}
                            className="p-1.5 rounded-lg border border-white/5 hover:bg-rose-500/10 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Sale"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Sale Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-zinc-900 border border-white/10 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <button 
              onClick={handleCloseModal}
              className="absolute right-6 top-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold font-display text-white mb-6">
              {editingSale ? 'Edit Sale Record' : 'Log New Sale'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Product */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Product</label>
                <select
                  {...register('productId')}
                  className="w-full px-4 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-zinc-400"
                >
                  <option value="">Select product to sell...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stock: {p.currentStock !== undefined ? p.currentStock : 'Unlimited'}) - GH₵ {p.price}
                    </option>
                  ))}
                </select>
                {errors.productId && <p className="text-[10px] text-rose-400 font-bold ml-1">{errors.productId.message}</p>}
              </div>

              {/* Qty, Price & Cost Price */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Quantity</label>
                  <input 
                    type="number"
                    {...register('quantity')}
                    className="w-full px-3 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                  />
                  {errors.quantity && <p className="text-[10px] text-rose-400 font-bold ml-1">{errors.quantity.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Selling Price</label>
                  <input 
                    type="number"
                    step="0.01"
                    {...register('price')}
                    className="w-full px-3 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                  />
                  {errors.price && <p className="text-[10px] text-rose-400 font-bold ml-1">{errors.price.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Cost Price</label>
                  <input 
                    type="number"
                    step="0.01"
                    {...register('costPrice')}
                    className="w-full px-3 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                  />
                  {errors.costPrice && <p className="text-[10px] text-rose-400 font-bold ml-1">{errors.costPrice.message}</p>}
                </div>
              </div>

              {/* Platform & Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Platform Channel</label>
                  <select
                    {...register('platform')}
                    className="w-full px-4 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-zinc-400"
                  >
                    {['Website', 'WhatsApp', 'Instagram', 'Facebook', 'Jiji', 'Walk-in', 'Referral'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Payment Method</label>
                  <select
                    {...register('paymentMethod')}
                    className="w-full px-4 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-zinc-400"
                  >
                    {['Cash', 'MoMo', 'Card', 'Bank Transfer'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Adjustments */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Discount (GH₵)</label>
                  <input 
                    type="number"
                    step="0.01"
                    {...register('discount')}
                    className="w-full px-4 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Date Sold</label>
                  <input 
                    type="date"
                    {...register('soldAt')}
                    className="w-full px-4 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                  />
                  {errors.soldAt && <p className="text-[10px] text-rose-400 font-bold ml-1">{errors.soldAt.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Notes</label>
                <input 
                  type="text"
                  placeholder="Courier info, instructions..."
                  {...register('notes')}
                  className="w-full px-4 py-3 bg-black border border-white/5 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                />
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
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer transition-all shadow-lg shadow-primary/25 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : editingSale ? 'Save Changes' : 'Submit Sale'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

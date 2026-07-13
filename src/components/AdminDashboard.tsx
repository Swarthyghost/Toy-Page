"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, DollarSign, Tag, FileText, Upload, LogOut, Gift, Settings, BookOpen, List, LayoutGrid, Copy, Star } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { fetchProducts, createProduct, updateProduct, deleteProduct, Product, SiteSettings, fetchSiteSettings, updateSiteSettings, fetchOrders, CustomerOrder, updateOrder, deleteOrder } from '../services/firebaseApi';
import { uploadImage } from '../config/cloudinary';
import PromoManagement from './PromoManagement';
import GuidesManagement from './GuidesManagement';

export default function AdminDashboard() {
  const { adminUser, logout } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'promos' | 'settings' | 'orders' | 'guides'>('products');
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    image: '',
    images: [] as string[],
    category: 'Vibrators',
    description: '',
    isOutOfStock: false,
    featured: false,
  });
  const [editingOrder, setEditingOrder] = useState<CustomerOrder | null>(null);
  const [orderFormData, setOrderFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
  });
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<(File | null)[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('admin_orders_view_mode') as 'compact' | 'detailed';
      if (savedMode === 'compact' || savedMode === 'detailed') {
        setViewMode(savedMode);
      }
    }
  }, []);

  const handleSetViewMode = (mode: 'compact' | 'detailed') => {
    setViewMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_orders_view_mode', mode);
    }
  };

  useEffect(() => {
    loadProducts();
    loadSettings();
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await deleteOrder(orderId);
      alert("Order deleted successfully!");
      loadOrders();
    } catch (error) {
      console.error(error);
      alert("Failed to delete order.");
    }
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder || !editingOrder.id) return;
    setIsSavingOrder(true);
    try {
      await updateOrder(editingOrder.id, orderFormData);
      alert("Order contact details updated successfully!");
      setEditingOrder(null);
      loadOrders();
    } catch (error) {
      console.error(error);
      alert("Failed to update order details.");
    } finally {
      setIsSavingOrder(false);
    }
  };

  const loadSettings = async () => {
    const data = await fetchSiteSettings();
    if (data) setSiteSettings(data);
    else setSiteSettings({ isSalesNotificationActive: false, salesNotificationText: '', isDiscountTagsActive: true });
  };

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
  };

  const handleFeaturedToggle = (checked: boolean) => {
    if (checked) {
      const currentFeatured = products.find(p => p.featured && p.id !== editingProduct?.id);
      if (currentFeatured) {
        const confirmSwap = window.confirm(`This will replace "${currentFeatured.name}" as the featured product. Do you want to proceed?`);
        if (!confirmSwap) {
          return;
        }
      }
    }
    setFormData(prev => ({ ...prev, featured: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      console.log('Submitting product:', formData);
      
      let parsedPrice = parseFloat(formData.price);
      let parsedOriginalPrice = formData.originalPrice ? parseFloat(formData.originalPrice) : null;

      if (parsedOriginalPrice !== null && parsedOriginalPrice < parsedPrice) {
        const temp = parsedPrice;
        parsedPrice = parsedOriginalPrice;
        parsedOriginalPrice = temp;
      }

      const payload = {
        name: formData.name,
        price: parsedPrice,
        originalPrice: parsedOriginalPrice,
        image: formData.image.startsWith('data:') ? '' : formData.image,
        images: formData.images.filter(img => !img.startsWith('data:')),
        category: formData.category,
        description: formData.description,
        isOutOfStock: formData.isOutOfStock,
        featured: formData.featured,
      };

      const validAdditionalFiles = additionalImageFiles.filter((f): f is File => f !== null);

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload, imageFile || undefined, validAdditionalFiles);
      } else {
        await createProduct(payload, imageFile || undefined, validAdditionalFiles);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      setAdditionalImageFiles([]);
      setFormData({ name: '', price: '', originalPrice: '', image: '', images: [], category: 'Vibrators', description: '', isOutOfStock: false, featured: false });
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Failed to save product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
      image: product.image,
      images: product.images || [],
      category: product.category,
      description: product.description,
      isOutOfStock: product.isOutOfStock || false,
      featured: product.featured || false,
    });
    setImageFile(null);
    setAdditionalImageFiles(new Array(product.images?.length || 0).fill(null));
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product. Please try again.');
      }
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdditionalImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to total 10 additional images
    const availableSlots = 10 - formData.images.length;
    const filesToAdd = files.slice(0, availableSlots);

    // Update files state immediately to preserve order
    const newFiles = [...additionalImageFiles, ...filesToAdd];
    setAdditionalImageFiles(newFiles);

    // Read all files as Data URLs in order
    const readFiles = filesToAdd.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    const newImagePreviews = await Promise.all(readFiles);
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImagePreviews]
    }));
  };

  const removeAdditionalImage = (index: number) => {
    const newFiles = [...additionalImageFiles];
    newFiles.splice(index, 1);
    setAdditionalImageFiles(newFiles);

    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData({ ...formData, images: newImages });
  };

  const replaceAdditionalImage = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const newFiles = [...additionalImageFiles];
      newFiles[index] = file;
      setAdditionalImageFiles(newFiles);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...formData.images];
        newImages[index] = reader.result as string;
        setFormData({ ...formData, images: newImages });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Admin Header */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
              <p className="text-white/60">Welcome back, {adminUser?.displayName}</p>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="border-b border-white/10 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('promos')}
              className={`py-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'promos'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Gift size={18} />
              Promo Codes
            </button>
            <button
              onClick={() => {
                setActiveTab('orders');
                loadOrders();
              }}
              className={`py-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <FileText size={18} />
              Customer Orders
            </button>
            <button
              onClick={() => setActiveTab('guides')}
              className={`py-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'guides'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <BookOpen size={18} />
              Guides
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <Settings size={18} />
              Site Settings
            </button>
            <div className="ml-auto flex items-center gap-4">
              <a
                href="/"
                className="py-4 text-white/60 hover:text-white transition-colors"
              >
                View Store
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'products' ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Product Management</h2>
              <p className="text-white/40">Manage your product collection and inventory.</p>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setImageFile(null);
                setAdditionalImageFiles([]);
                setFormData({ name: '', price: '', originalPrice: '', image: '', images: [], category: 'Vibrators', description: '', isOutOfStock: false, featured: false });
                setIsModalOpen(true);
              }}
              className="px-6 py-3 bg-primary text-white font-bold rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>

      <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Product</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Category</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Price</th>
              <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <Image src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover" width={48} height={48} unoptimized />
                    <span className="font-bold">{product.name}</span>
                    {product.featured && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/25 text-yellow-400 text-[10px] font-bold uppercase tracking-wider rounded-full border border-yellow-400/20">
                        <Star size={10} className="fill-yellow-400" /> Featured
                      </span>
                    )}
                    {product.isOutOfStock && (
                      <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider rounded-full border border-primary/20">
                        Restocking
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-6 text-white/60">{product.category}</td>
                <td className="p-6 font-display font-bold">GHS {product.price.toFixed(2)}</td>
                <td className="p-6">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
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
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <Tag size={14} /> Product Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <DollarSign size={14} /> Final Selling Price (GHS)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <DollarSign size={14} /> Original Price (GHS) (Higher price for strikethrough. Leave empty to turn off sale)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                      placeholder="Leave empty if no discount"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <ImageIcon size={14} /> Main Image
                    </label>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <label className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary transition-colors cursor-pointer flex items-center justify-center gap-2">
                          <Upload size={18} />
                          <span>{imageFile ? imageFile.name : 'Choose main image'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      
                      {(formData.image || imageFile) && (
                        <div className="relative">
                           <Image
                             src={formData.image}
                             alt="Product preview"
                             className="w-full h-48 object-cover rounded-xl"
                             width={400}
                             height={192}
                             unoptimized
                           />
                          {imageFile && (
                            <div className="absolute top-2 right-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                              New Image
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <ImageIcon size={14} /> Additional Images (Optional - Max 10)
                    </label>
                    
                    <div className="grid grid-cols-2 gap-4">
                      {/* Existing additional images */}
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative group overflow-hidden rounded-xl border border-white/10 aspect-square">
                           <Image src={img} alt="" className="object-cover transition-transform group-hover:scale-110" fill sizes="100px" unoptimized />
                          
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                            <label className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg cursor-pointer transition-colors">
                              <Upload size={16} />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => replaceAdditionalImage(e, idx)}
                                className="hidden"
                              />
                            </label>
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(idx)}
                              className="p-2 bg-primary/20 hover:bg-primary/40 text-primary rounded-lg transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          
                          {/* New Label Tag */}
                          {additionalImageFiles[idx] && (
                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-white text-[8px] font-bold uppercase tracking-wider rounded-full">
                              New
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {/* Add more button if less than 10 additional images */}
                      {formData.images.length < 10 && (
                        <label className="h-32 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer text-center px-4">
                          <Plus size={24} className="text-white/20" />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 block">Add Images</span>
                            <span className="text-[8px] text-white/10 uppercase tracking-tighter">(Optional)</span>
                          </div>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleAdditionalImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                    <Tag size={14} /> Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors appearance-none"
                  >
                    <option value="Vibrators">Vibrators</option>
                    <option value="BDSM">BDSM</option>
                    <option value="Lubricants">Lubricants</option>
                    <option value="Mens Toy">Men's Toy</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors"
                     onClick={() => setFormData({ ...formData, isOutOfStock: !formData.isOutOfStock })}>
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${formData.isOutOfStock ? 'bg-primary border-primary' : 'border-white/20'}`}>
                    {formData.isOutOfStock && <X size={14} className="text-white" />}
                  </div>
                  <span className="text-sm font-bold text-white/80">Mark as Out of Stock (Restocking soon)</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors"
                       onClick={() => handleFeaturedToggle(!formData.featured)}>
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${formData.featured ? 'bg-primary border-primary' : 'border-white/20'}`}>
                      {formData.featured && <Star size={14} className="text-white fill-white" />}
                    </div>
                    <span className="text-sm font-bold text-white/80">Set as Featured Product</span>
                  </div>
                  {formData.featured && (
                    <p className="text-xs text-primary/80 ml-1">
                      {products.find(p => p.featured && p.id !== editingProduct?.id) 
                        ? `Note: This will replace "${products.find(p => p.featured && p.id !== editingProduct?.id)?.name}" as the featured product.`
                        : 'This product will be highlighted on the homepage.'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                    <FileText size={14} /> Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors min-h-[120px] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUploading}
                  className="w-full py-5 bg-primary text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {editingProduct ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingProduct ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </div>
      ) : activeTab === 'promos' ? (
        <PromoManagement />
      ) : activeTab === 'orders' ? (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Customer & Order Management</h2>
              <p className="text-white/40">View and copy customer contact details and order histories.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
                <button
                  onClick={() => handleSetViewMode('compact')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    viewMode === 'compact'
                      ? 'bg-primary text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <List size={14} />
                  Compact
                </button>
                <button
                  onClick={() => handleSetViewMode('detailed')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                    viewMode === 'detailed'
                      ? 'bg-primary text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <LayoutGrid size={14} />
                  Detailed
                </button>
              </div>

              <button
                onClick={loadOrders}
                className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-white font-bold transition-all text-sm flex items-center gap-2"
              >
                Refresh Orders
              </button>
            </div>
          </div>

          {loadingOrders ? (
            <div className="py-24 text-center text-white/40">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-24 text-center text-white/40 bg-zinc-900 border border-white/10 rounded-[2.5rem]">
              No orders found. Once customers checkout or pay, their details will appear here.
            </div>
          ) : (
            <div className={viewMode === 'compact' ? "space-y-3" : "space-y-6"}>
              {orders.map((order) => (
                viewMode === 'compact' ? (
                  /* Compact horizontal row view */
                  <div
                    key={order.id}
                    className="bg-zinc-900 border border-white/10 rounded-2xl p-4 hover:border-primary/50 transition-colors w-full"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Customer Info (Name + Phone) */}
                      <div className="md:col-span-3 flex flex-col justify-center min-w-0">
                        <p className="text-sm font-bold text-white truncate" title={order.name}>{order.name}</p>
                        <p className="text-xs text-white/60 font-mono select-all truncate mt-0.5">{order.phone}</p>
                      </div>

                      {/* Items Ordered */}
                      <div className="md:col-span-3 flex flex-col justify-center min-w-0">
                        <div className="text-xs text-white/80 line-clamp-2" title={order.items?.map(i => `${i.name} x${i.quantity}`).join(', ')}>
                          {order.items?.map((item, idx) => (
                            <span key={idx}>
                              {idx > 0 && ', '}
                              {item.name} <span className="text-primary font-bold">x{item.quantity}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Order Date & ID */}
                      <div className="md:col-span-2 flex flex-col justify-center min-w-0">
                        <p className="text-xs text-white/80">
                          {order.createdAt ? order.createdAt.toDate().toLocaleDateString() : "Date N/A"}
                        </p>
                        <p className="text-[10px] text-white/30 font-mono select-all truncate mt-0.5" title={order.id}>
                          ID: {order.id}
                        </p>
                      </div>

                      {/* Total Price & Payment Badge */}
                      <div className="md:col-span-2 flex flex-col md:items-end justify-center min-w-0">
                        <p className="text-sm font-bold text-primary">GHS {order.totalPrice.toFixed(2)}</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 uppercase tracking-wider w-fit ${
                          order.paymentMethod === 'Paystack' 
                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                            : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {order.paymentMethod}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="md:col-span-2 flex justify-start md:justify-end items-center gap-1.5">
                        <button
                          onClick={() => {
                            const contactInfo = `Name: ${order.name}\nPhone: ${order.phone}\nEmail: ${order.email}\nLocation: ${order.location}`;
                            navigator.clipboard.writeText(contactInfo);
                            alert("Contact info copied to clipboard!");
                          }}
                          className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-colors"
                          title="Copy Contact Details"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setEditingOrder(order);
                            setOrderFormData({
                              name: order.name,
                              email: order.email,
                              phone: order.phone,
                              location: order.location,
                            });
                          }}
                          className="p-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg transition-colors"
                          title="Edit Contact"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id!)}
                          className="p-2 bg-red-900/10 border border-red-500/20 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Detailed card view */
                  <div
                    key={order.id}
                    className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 hover:border-primary/50 transition-colors"
                  >
                    <div className="grid md:grid-cols-4 gap-8">
                      {/* Customer Info */}
                      <div className="space-y-4 md:border-r border-white/10 pr-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Name</span>
                          <p className="text-lg font-bold">{order.name}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Email</span>
                          <p className="text-sm text-white/80 select-all">{order.email}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Phone</span>
                          <p className="text-sm text-white/80 select-all font-mono">{order.phone}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Location</span>
                          <p className="text-sm text-white/80">{order.location}</p>
                        </div>
                        <button
                          onClick={() => {
                            const contactInfo = `Name: ${order.name}\nPhone: ${order.phone}\nEmail: ${order.email}\nLocation: ${order.location}`;
                            navigator.clipboard.writeText(contactInfo);
                            alert("Contact info copied to clipboard!");
                          }}
                          className="w-full mt-2 py-2 bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-primary/30 transition-all"
                        >
                          Copy Contact
                        </button>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              setEditingOrder(order);
                              setOrderFormData({
                                name: order.name,
                                email: order.email,
                                phone: order.phone,
                                location: order.location,
                              });
                            }}
                            className="flex-grow py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order.id!)}
                            className="py-2 px-3 bg-red-900/20 border border-red-500/30 hover:bg-red-900/40 text-red-400 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center"
                            title="Delete Order"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Order Details */}
                      <div className="md:col-span-2 space-y-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Items Ordered</span>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm py-1 border-b border-white/5">
                              <span className="text-white/80">
                                {item.name} <span className="text-primary font-bold">x{item.quantity}</span>
                              </span>
                              <span className="font-mono">GHS {(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-col justify-between items-end text-right md:border-l border-white/10 pl-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Order ID</span>
                          <span className="font-mono text-xs text-white/40 select-all">{order.id}</span>
                        </div>
                        <div className="my-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Payment Method</span>
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold mt-1 uppercase tracking-wider ${
                            order.paymentMethod === 'Paystack' 
                              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' 
                              : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {order.paymentMethod}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 block">Total Price</span>
                          <span className="text-2xl font-display font-bold text-primary">GHS {order.totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="mt-2 text-xs text-white/30 uppercase tracking-wider">
                          {order.createdAt ? order.createdAt.toDate().toLocaleString() : "Date N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          {/* Edit Order Modal */}
          <AnimatePresence>
            {editingOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setEditingOrder(null)}
                  className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl z-10"
                >
                  <button
                    onClick={() => setEditingOrder(null)}
                    className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>

                  <h3 className="text-2xl font-bold mb-2">Edit Contact Details</h3>
                  <p className="text-white/40 mb-6 text-sm">Update customer details for Order ID: {editingOrder.id}</p>

                  <form onSubmit={handleUpdateOrder} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Name</label>
                      <input
                        type="text"
                        required
                        value={orderFormData.name}
                        onChange={(e) => setOrderFormData({ ...orderFormData, name: e.target.value })}
                        className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email</label>
                      <input
                        type="email"
                        required
                        value={orderFormData.email}
                        onChange={(e) => setOrderFormData({ ...orderFormData, email: e.target.value })}
                        className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Phone</label>
                      <input
                        type="text"
                        required
                        value={orderFormData.phone}
                        onChange={(e) => setOrderFormData({ ...orderFormData, phone: e.target.value })}
                        className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Location</label>
                      <textarea
                        required
                        value={orderFormData.location}
                        onChange={(e) => setOrderFormData({ ...orderFormData, location: e.target.value })}
                        className="w-full px-5 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors min-h-[80px] resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingOrder}
                      className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50 mt-4"
                    >
                      {isSavingOrder ? 'Saving...' : 'Save Changes'}
                    </button>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      ) : activeTab === 'guides' ? (
        <GuidesManagement />
      ) : (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Site Settings</h2>
            <p className="text-white/40">Manage global settings like sales notifications.</p>
          </div>
          
          {siteSettings && (
            <div className="max-w-2xl bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10">
              <form onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingSettings(true);
                try {
                  await updateSiteSettings(siteSettings);
                  alert('Settings saved successfully!');
                } catch (error) {
                  console.error(error);
                  alert('Failed to save settings.');
                } finally {
                  setIsSavingSettings(false);
                }
              }} className="space-y-6">
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isSalesNotificationActive"
                    checked={siteSettings.isSalesNotificationActive}
                    onChange={(e) => setSiteSettings({ ...siteSettings, isSalesNotificationActive: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <label htmlFor="isSalesNotificationActive" className="text-white/80 font-bold">
                    Enable Global Sales Notification Banner
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                    <FileText size={14} /> Notification Banner Text
                  </label>
                  <input
                    type="text"
                    required={siteSettings.isSalesNotificationActive}
                    value={siteSettings.salesNotificationText}
                    onChange={(e) => setSiteSettings({ ...siteSettings, salesNotificationText: e.target.value })}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                    placeholder="e.g., CATCHY SALES SALES SALES!!! 🔥"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <input
                    type="checkbox"
                    id="isDiscountTagsActive"
                    checked={siteSettings.isDiscountTagsActive}
                    onChange={(e) => setSiteSettings({ ...siteSettings, isDiscountTagsActive: e.target.checked })}
                    className="w-5 h-5 rounded border-white/20 bg-white/10 text-primary focus:ring-primary focus:ring-offset-0"
                  />
                  <label htmlFor="isDiscountTagsActive" className="text-white/80 font-bold">
                    Enable Discount Sales Tags on Products
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="w-full py-5 bg-primary text-white font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                >
                  {isSavingSettings ? 'Saving...' : 'Save Settings'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

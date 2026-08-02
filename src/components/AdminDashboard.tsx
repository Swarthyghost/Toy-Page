"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, DollarSign, Tag, FileText, Upload, LogOut, Gift, Settings, BookOpen, List, LayoutGrid, Copy, Star, Eye, EyeOff, TrendingUp, AlertTriangle, PlusCircle, History, Database, Layers, Search } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { fetchProducts, createProduct, updateProduct, deleteProduct, Product, SiteSettings, fetchSiteSettings, updateSiteSettings, fetchOrders, CustomerOrder, updateOrder, deleteOrder, updateProductsVisibility, fetchInventoryLogs, logStockAdjustment, createPurchaseOrder, updatePurchaseOrder } from '../services/firebaseApi';
import { uploadImage } from '../config/cloudinary';
import PromoManagement from './PromoManagement';
import GuidesManagement from './GuidesManagement';
import RetailOS from './retail-os/RetailOS';
import MarkdownEditor from './MarkdownEditor';

export default function AdminDashboard() {
  const { adminUser, logout } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'promos' | 'settings' | 'orders' | 'guides' | 'retail-os'>('products');
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
    hide_product: false,
    costPrice: '',
    openingStock: '',
    minimumStock: '5',
    status: 'active' as 'active' | 'draft' | 'archived',
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
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals for Stock Management
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Stock Form States
  const [adjustForm, setAdjustForm] = useState({
    productId: '',
    type: 'add' as 'add' | 'remove',
    adjustQty: '',
    reason: '',
  });

  const [restockForm, setRestockForm] = useState({
    productId: '',
    quantity: '',
    costPrice: '',
  });

  // History state
  const [historyProductId, setHistoryProductId] = useState<string | null>(null);
  const [historyLogs, setHistoryLogs] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
    setSelectedProductIds([]);
  }, [visibilityFilter, activeTab]);

  useEffect(() => {
    loadProducts();
    loadSettings();
    loadOrders();
  }, []);

  const filteredProducts = products.filter(product => {
    // Visibility
    if (visibilityFilter === 'visible' && product.hide_product) return false;
    if (visibilityFilter === 'hidden' && !product.hide_product) return false;

    // Search Name / Category
    const name = (product.productName || product.name || '').toLowerCase();
    if (searchTerm && !name.includes(searchTerm.toLowerCase())) return false;
    if (categoryFilter !== 'All' && product.category !== categoryFilter) return false;

    // Stock Status
    const current = product.currentStock || 0;
    const min = product.minimumStock || 5;
    if (statusFilter === 'In Stock' && current <= min) return false;
    if (statusFilter === 'Low Stock' && (current > min || current === 0)) return false;
    if (statusFilter === 'Out of Stock' && current > 0) return false;

    return true;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProductIds(prev => [...prev, productId]);
    } else {
      setSelectedProductIds(prev => prev.filter(id => id !== productId));
    }
  };

  const handleBulkVisibility = async (hide: boolean) => {
    if (selectedProductIds.length === 0) return;
    const confirmMessage = hide 
      ? `Are you sure you want to hide the ${selectedProductIds.length} selected products?`
      : `Are you sure you want to unhide the ${selectedProductIds.length} selected products?`;
      
    if (confirm(confirmMessage)) {
      try {
        setIsUploading(true);
        await updateProductsVisibility(selectedProductIds, hide);
        setSelectedProductIds([]);
        alert("Product visibility updated successfully.");
        loadProducts();
      } catch (error) {
        console.error("Error bulk updating product visibility:", error);
        alert(`Failed to update product visibility: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsUploading(false);
      }
    }
  };

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
    setSelectedProductIds([]);
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

      let parsedCostPrice = parseFloat(formData.costPrice) || 0;
      let parsedOpeningStock = parseInt(formData.openingStock) || 0;
      let parsedMinimumStock = parseInt(formData.minimumStock) || 5;

      const currentStock = editingProduct
        ? (editingProduct.currentStock !== undefined ? editingProduct.currentStock : parsedOpeningStock)
        : parsedOpeningStock;

      const payload = {
        name: formData.name,
        productName: formData.name,
        price: parsedPrice,
        sellingPrice: parsedPrice,
        originalPrice: parsedOriginalPrice,
        image: formData.image.startsWith('data:') ? '' : formData.image,
        images: formData.images.filter(img => !img.startsWith('data:')),
        category: formData.category,
        description: formData.description,
        isOutOfStock: currentStock === 0,
        featured: formData.featured,
        hide_product: formData.hide_product,
        costPrice: parsedCostPrice,
        openingStock: parsedOpeningStock,
        currentStock,
        minimumStock: parsedMinimumStock,
        status: formData.status,
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
      setSelectedProductIds([]);
      setFormData({ name: '', price: '', originalPrice: '', image: '', images: [], category: 'Vibrators', description: '', isOutOfStock: false, featured: false, hide_product: false, costPrice: '', openingStock: '', minimumStock: '5', status: 'active' });
      loadProducts();
      alert("Product saved successfully.");
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
      hide_product: product.hide_product || false,
      costPrice: (product.costPrice || 0).toString(),
      openingStock: (product.openingStock || 0).toString(),
      minimumStock: (product.minimumStock || 5).toString(),
      status: product.status || 'active',
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

  const handleDuplicate = (product: Product) => {
    setEditingProduct(null);
    setFormData({
      name: `${product.name} (Copy)`,
      price: product.price.toString(),
      originalPrice: product.originalPrice ? product.originalPrice.toString() : '',
      image: product.image,
      images: product.images || [],
      category: product.category,
      description: product.description,
      isOutOfStock: (product.currentStock || 0) === 0,
      featured: false,
      hide_product: product.hide_product || false,
      costPrice: (product.costPrice || 0).toString(),
      openingStock: (product.currentStock || 0).toString(),
      minimumStock: (product.minimumStock || 5).toString(),
      status: 'active',
    });
    setImageFile(null);
    setAdditionalImageFiles([]);
    setIsModalOpen(true);
  };

  const handleOpenHistory = async (productId: string) => {
    setHistoryProductId(productId);
    setLoadingHistory(true);
    setIsHistoryModalOpen(true);
    try {
      const logs = await fetchInventoryLogs();
      const productLogs = logs.filter((l: any) => l.productId === productId);
      setHistoryLogs(productLogs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { productId, type, adjustQty, reason } = adjustForm;
    if (!productId || !adjustQty || !reason) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const selected = products.find(p => p.id === productId);
      if (!selected) return;

      await logStockAdjustment({
        productId,
        productName: selected.productName || selected.name,
        adjustQty: parseInt(adjustQty),
        type,
        reason,
      });

      alert('Adjustment logged successfully!');
      setIsAdjustmentModalOpen(false);
      setAdjustForm({ productId: '', type: 'add', adjustQty: '', reason: '' });
      loadProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { productId, quantity, costPrice } = restockForm;
    if (!productId || !quantity || !costPrice) {
      alert('Please fill out all fields.');
      return;
    }

    try {
      const selected = products.find(p => p.id === productId);
      if (!selected) return;

      const poId = await createPurchaseOrder({
        productId,
        productName: selected.productName || selected.name,
        quantity: parseInt(quantity),
        costPrice: parseFloat(costPrice),
        status: 'pending',
      });

      await updatePurchaseOrder(poId, { status: 'completed' });

      alert('Restocked successfully!');
      setIsRestockModalOpen(false);
      setRestockForm({ productId: '', quantity: '', costPrice: '' });
      loadProducts();
    } catch (err) {
      console.error(err);
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
              onClick={() => setActiveTab('retail-os')}
              className={`py-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'retail-os'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-white/60 hover:text-white'
              }`}
            >
              <TrendingUp size={18} />
              Retail OS
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
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">Product Management</h2>
              <p className="text-white/40">Manage your product collection and inventory levels.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => setIsAdjustmentModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all cursor-pointer text-xs"
              >
                <Settings size={14} />
                <span>Adjustment</span>
              </button>
              <button 
                onClick={() => setIsRestockModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-white/10 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all cursor-pointer text-xs"
              >
                <PlusCircle size={14} />
                <span>Restock</span>
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setImageFile(null);
                  setAdditionalImageFiles([]);
                  setFormData({ name: '', price: '', originalPrice: '', image: '', images: [], category: 'Vibrators', description: '', isOutOfStock: false, featured: false, hide_product: false, costPrice: '', openingStock: '', minimumStock: '5', status: 'active' });
                  setIsModalOpen(true);
                }}
                className="px-6 py-3 bg-primary text-white font-bold rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform text-xs"
              >
                <Plus size={16} />
                Add Product
              </button>
            </div>
          </div>

          {/* 4 Widgets Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Products", val: products.length, icon: Layers, color: "text-zinc-400" },
              { label: "Inventory Value", val: `GH₵ ${products.reduce((acc, p) => acc + ((p.costPrice || 0) * (p.currentStock || 0)), 0).toFixed(2)}`, icon: Layers, color: "text-indigo-400" },
              { label: "Low Stock Items", val: products.filter(p => {
                const stock = p.currentStock || 0;
                const min = p.minimumStock || 5;
                return stock > 0 && stock <= min;
              }).length, icon: AlertTriangle, color: "text-amber-400 font-bold" },
              { label: "Out of Stock Items", val: products.filter(p => (p.currentStock || 0) === 0).length, icon: AlertTriangle, color: "text-rose-400 font-bold" },
            ].map((widget, idx) => {
              const Icon = widget.icon;
              return (
                <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-white/40">{widget.label}</span>
                    <Icon size={14} className={widget.color} />
                  </div>
                  <span className="text-lg font-bold font-display text-white mt-2 block">{widget.val}</span>
                </div>
              );
            })}
          </div>

          {/* Visibility Filters, Search, Category Dropdowns */}
          <div className="grid md:grid-cols-4 gap-4 items-center">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search size={16} className="absolute left-3.5 top-3 text-zinc-500" />
              <input 
                type="text"
                placeholder="Search catalog products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-xs text-white"
              />
            </div>
            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-xs text-zinc-400"
            >
              <option value="All">All Categories</option>
              {['Vibrators', 'Male Toys', 'BDSM', 'Wearables', 'Lubricants', 'Strap-Ons', 'Other Products'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 bg-zinc-900 border border-white/10 rounded-xl focus:outline-none focus:border-primary text-xs text-zinc-400"
            >
              <option value="All">All Stock Levels</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>

          {/* Visibility filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
              {(['all', 'visible', 'hidden'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setVisibilityFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    visibilityFilter === filter
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {selectedProductIds.length > 0 && (
              <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
                <span className="text-xs text-white/40 px-3 font-medium">
                  {selectedProductIds.length} selected
                </span>
                <button
                  type="button"
                  onClick={() => handleBulkVisibility(true)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <EyeOff size={14} /> Hide Selected
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkVisibility(false)}
                  className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye size={14} /> Unhide Selected
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40 w-12">
                      <input
                        type="checkbox"
                        checked={filteredProducts.length > 0 && selectedProductIds.length === filteredProducts.length}
                        onChange={handleSelectAll}
                        className="w-5 h-5 rounded border-white/20 bg-white/10 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                      />
                    </th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Product</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Category</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Cost (GHC)</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Selling (GHC)</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Opening</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Current Stock</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Minimum Level</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Status</th>
                    <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const currentStock = product.currentStock || 0;
                    const minStock = product.minimumStock || 5;
                    const isOut = currentStock === 0;
                    const isLow = currentStock <= minStock && !isOut;
                    return (
                      <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-6 w-12">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                            className="w-5 h-5 rounded border-white/20 bg-white/10 text-primary focus:ring-primary focus:ring-offset-0 cursor-pointer"
                          />
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10 bg-black flex-shrink-0 flex items-center justify-center">
                              {product.image ? (
                                <Image src={product.image} alt="" className="w-full h-full object-cover" width={48} height={48} unoptimized />
                              ) : (
                                <Layers size={18} className="text-white/20" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white">{product.name}</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {product.featured && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/25 text-yellow-400 text-[8px] font-bold uppercase tracking-wider rounded-full border border-yellow-400/20">
                                    <Star size={8} className="fill-yellow-400" /> Featured
                                  </span>
                                )}
                                {product.hide_product && (
                                  <span className="flex items-center gap-1 px-2 py-0.5 bg-white/10 text-white/60 text-[8px] font-bold uppercase tracking-wider rounded-full border border-white/10">
                                    <EyeOff size={8} /> Hidden
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6 text-white/60">{product.category}</td>
                        <td className="p-6 text-right font-display text-white/60 font-semibold">{(product.costPrice || 0).toFixed(2)}</td>
                        <td className="p-6 text-right font-display font-bold text-emerald-400">{(product.price).toFixed(2)}</td>
                        <td className="p-6 text-right text-white/40">{product.openingStock || 0}</td>
                        <td className="p-6 text-right font-bold text-white">{currentStock}</td>
                        <td className="p-6 text-right text-white/40">{minStock}</td>
                        <td className="p-6 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                            isOut
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                              : isLow
                                ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          }`}>
                            {isOut ? '🔴 Out of Stock' : isLow ? '🟡 Low Stock' : '🟢 In Stock'}
                          </span>
                        </td>
                        <td className="p-6">
                          <div className="flex justify-center gap-1.5">
                            <button
                              title="Edit"
                              onClick={() => handleEdit(product)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              title="Duplicate"
                              onClick={() => handleDuplicate(product)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              title="View History Logs"
                              onClick={() => handleOpenHistory(product.id)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors cursor-pointer"
                            >
                              <History size={14} />
                            </button>
                            <button
                              title="Delete"
                              onClick={() => handleDelete(product.id)}
                              className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-primary transition-colors cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <DollarSign size={14} /> Cost Price (GHS)
                    </label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      value={formData.costPrice}
                      onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <Layers size={14} /> Opening Stock
                    </label>
                    <input
                      required
                      disabled={!!editingProduct}
                      type="number"
                      value={formData.openingStock}
                      onChange={(e) => setFormData({ ...formData, openingStock: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <Layers size={14} /> Minimum Stock Alert Level
                    </label>
                    <input
                      required
                      type="number"
                      value={formData.minimumStock}
                      onChange={(e) => setFormData({ ...formData, minimumStock: e.target.value })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                      <Settings size={14} /> Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
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
                    <option value="Male Toys">Male Toys</option>
                    <option value="BDSM">BDSM</option>
                    <option value="Wearables">Wearables</option>
                    <option value="Lubricants">Lubricants</option>
                    <option value="Strap-Ons">Strap-Ons</option>
                    <option value="Other Products">Other Products</option>
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
                  <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors"
                       onClick={() => setFormData({ ...formData, hide_product: !formData.hide_product })}>
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${formData.hide_product ? 'bg-primary border-primary' : 'border-white/20'}`}>
                      {formData.hide_product && <EyeOff size={14} className="text-white" />}
                    </div>
                    <span className="text-sm font-bold text-white/80">Hide Product</span>
                  </div>
                  <p className="text-xs text-white/40 ml-1">
                    When enabled, this product will be hidden from all customer-facing pages and will only be visible in the Admin Product list.
                  </p>
                </div>

                <div className="space-y-2">
                  <MarkdownEditor
                    label="Product Description (Markdown)"
                    placeholder="Write a compelling product description in Markdown..."
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    minHeight="200px"
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
      ) : activeTab === 'retail-os' ? (
        <RetailOS />
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
      {/* Restock Modal */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsRestockModalOpen(false)}
              className="absolute right-6 top-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold font-display text-white mb-6">Restock Product</h3>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Product</label>
                <select
                  value={restockForm.productId}
                  onChange={(e) => setRestockForm({ ...restockForm, productId: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-zinc-400"
                  required
                >
                  <option value="">Select product to restock...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Current Stock: {p.currentStock || 0})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Restock Qty</label>
                  <input 
                    type="number"
                    min="1"
                    value={restockForm.quantity}
                    onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Unit Cost Price (GH₵)</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={restockForm.costPrice}
                    onChange={(e) => setRestockForm({ ...restockForm, costPrice: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer transition-colors hover:bg-primary-hover shadow-lg shadow-primary/25"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setIsAdjustmentModalOpen(false)}
              className="absolute right-6 top-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold font-display text-white mb-6">Manual Stock Adjustment</h3>

            <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Product</label>
                <select
                  value={adjustForm.productId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, productId: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-zinc-400"
                  required
                >
                  <option value="">Select product...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (Current: {p.currentStock || 0})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Adjustment Type</label>
                  <select
                    value={adjustForm.type}
                    onChange={(e) => setAdjustForm({ ...adjustForm, type: e.target.value as any })}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-zinc-400"
                    required
                  >
                    <option value="add">Add Stock (+)</option>
                    <option value="remove">Remove Stock (-)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Quantity</label>
                  <input 
                    type="number"
                    min="1"
                    value={adjustForm.adjustQty}
                    onChange={(e) => setAdjustForm({ ...adjustForm, adjustQty: e.target.value })}
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Reason</label>
                <textarea 
                  placeholder="Cycle count correction, damaged item..."
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-xs focus:outline-none focus:border-primary text-white h-20 resize-none"
                  required
                />
              </div>

              <div className="flex gap-4 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl text-xs cursor-pointer transition-colors hover:bg-primary-hover shadow-lg shadow-primary/25"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Product History Logs Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button 
              onClick={() => setIsHistoryModalOpen(false)}
              className="absolute right-6 top-6 p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold font-display text-white mb-6">Stock Transaction History</h3>

            <div className="space-y-4">
              {loadingHistory ? (
                <p className="text-center text-zinc-500 py-10 text-xs font-bold">Loading transaction logs...</p>
              ) : historyLogs.length === 0 ? (
                <p className="text-center text-zinc-500 py-10 text-xs font-bold">No transaction history found for this product.</p>
              ) : (
                <div className="space-y-3">
                  {historyLogs.map((log) => (
                    <div key={log.id} className="p-4 bg-black/20 border border-white/5 rounded-2xl text-xs flex justify-between items-center gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            log.type === 'in'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : log.type === 'out'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {log.type}
                          </span>
                          <span className="font-bold text-zinc-300">
                            {log.type === 'in' ? '+' : log.type === 'out' ? '-' : ''}{log.changeQty} units
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block">Balance: {log.newQty} units</span>
                        <p className="text-[11px] text-zinc-400 italic mt-1">"{log.reason}"</p>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-sans text-right">
                        {log.createdAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      )}
    </div>
  );
}

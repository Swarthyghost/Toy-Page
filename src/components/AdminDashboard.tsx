import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, DollarSign, Tag, FileText, Upload, LogOut, Gift, Settings } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { fetchProducts, createProduct, updateProduct, deleteProduct, Product, SiteSettings, fetchSiteSettings, updateSiteSettings } from '../services/firebaseApi';
import { uploadImage } from '../config/cloudinary';
import PromoManagement from './PromoManagement';

export default function AdminDashboard() {
  const { adminUser, logout } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'promos' | 'settings'>('products');
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    image: '',
    images: [] as string[],
    category: 'Vibrators',
    description: '',
    isOutOfStock: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<(File | null)[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadProducts();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const data = await fetchSiteSettings();
    if (data) setSiteSettings(data);
    else setSiteSettings({ isSalesNotificationActive: false, salesNotificationText: '', isDiscountTagsActive: true });
  };

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      console.log('Submitting product:', formData);
      
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        image: formData.image.startsWith('data:') ? '' : formData.image,
        images: formData.images.filter(img => !img.startsWith('data:')),
        category: formData.category,
        description: formData.description,
        isOutOfStock: formData.isOutOfStock,
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
      setFormData({ name: '', price: '', originalPrice: '', image: '', images: [], category: 'Vibrators', description: '', isOutOfStock: false });
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
                setFormData({ name: '', price: '', originalPrice: '', image: '', images: [], category: 'Vibrators', description: '', isOutOfStock: false });
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
                    <img src={product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <span className="font-bold">{product.name}</span>
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
                      <DollarSign size={14} /> Price (GHS)
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
                      <DollarSign size={14} /> Original Price (GHS) (Optional - For Discounts)
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
                          <img
                            src={formData.image}
                            alt="Product preview"
                            className="w-full h-48 object-cover rounded-xl"
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
                          <img src={img} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          
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

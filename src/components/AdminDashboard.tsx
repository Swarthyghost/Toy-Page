import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, DollarSign, Tag, FileText, Upload, LogOut, Gift } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { fetchProducts, createProduct, updateProduct, deleteProduct, Product } from '../services/firebaseApi';
import { uploadImage } from '../config/cloudinary';
import PromoManagement from './PromoManagement';

export default function AdminDashboard() {
  const { adminUser, logout } = useAdminAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'promos'>('products');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: 'Vibrators',
    description: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await fetchProducts();
    setProducts(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      console.log('Submitting product:', formData);
      console.log('Image file:', imageFile);
      
      // For testing, let's try without image first
      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        image: imageFile ? formData.image : 'https://via.placeholder.com/300x300/000000/FFFFFF?text=Product+Image', // Default placeholder
        category: formData.category,
        description: formData.description,
      };

      console.log('Payload:', payload);

      if (editingProduct) {
        console.log('Updating product:', editingProduct.id);
        await updateProduct(editingProduct.id, payload, imageFile || undefined);
      } else {
        console.log('Creating new product');
        await createProduct(payload, imageFile || undefined);
      }

      console.log('Product saved successfully');
      setIsModalOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      setFormData({ name: '', price: '', image: '', category: 'Vibrators', description: '' });
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
      image: product.image,
      category: product.category,
      description: product.description,
    });
    setImageFile(null);
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
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
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
                setFormData({ name: '', price: '', image: '', category: 'Vibrators', description: '' });
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

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 ml-1">
                    <ImageIcon size={14} /> Product Image
                  </label>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary transition-colors cursor-pointer flex items-center justify-center gap-2">
                        <Upload size={18} />
                        <span>{imageFile ? imageFile.name : 'Choose image file'}</span>
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
                    <option value="Accessories">Accessories</option>
                    <option value="Mens Toy "> Men's Toy</option>
                  </select>
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
      ) : (
        <PromoManagement />
      )}
    </div>
  );
}

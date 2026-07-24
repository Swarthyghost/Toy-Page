"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, X, Tag, FileText, Upload, Copy, Eye, Calendar, Search } from 'lucide-react';
import { fetchGuides, createGuide, updateGuide, deleteGuide, Guide, fetchProducts, Product } from '../services/firebaseApi';
import { Timestamp } from 'firebase/firestore';
import { parseMarkdown } from '../utils/markdown';
import MarkdownEditor from './MarkdownEditor';

const CATEGORIES = ["Self-Care", "Beginner Guides", "Product Education", "Wellness Tips"];

export default function GuidesManagement() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [previewGuideData, setPreviewGuideData] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    featuredImage: '',
    featuredImageAlt: '',
    excerpt: '',
    body: '',
    category: 'Self-Care',
    status: 'draft' as 'draft' | 'published',
    publishDate: '',
    metaTitle: '',
    metaDescription: '',
    isFeatured: false,
    relatedProductIds: [] as string[],
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadGuides();
    loadProducts();
  }, []);

  const loadGuides = async () => {
    setLoading(true);
    try {
      const data = await fetchGuides();
      setGuides(data);
    } catch (error) {
      console.error("Failed to load guides:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products for picker:", error);
    }
  };

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData(prev => ({
      ...prev,
      title: val,
      slug: prev.slug === '' || prev.slug === prev.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '') 
        ? generatedSlug 
        : prev.slug
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    setFormData(prev => ({ ...prev, slug: val }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, featuredImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };



  const handleProductToggle = (productId: string) => {
    setFormData(prev => {
      const selected = prev.relatedProductIds.includes(productId)
        ? prev.relatedProductIds.filter(id => id !== productId)
        : [...prev.relatedProductIds, productId];
      return { ...prev, relatedProductIds: selected };
    });
  };

  const handleDuplicate = (guide: Guide) => {
    setEditingGuide(null);
    setImageFile(null);
    
    const duplicateTitle = `${guide.title} (Copy)`;
    const duplicateSlug = `${guide.slug}-copy`;
    
    setFormData({
      title: duplicateTitle,
      slug: duplicateSlug,
      featuredImage: guide.featuredImage,
      featuredImageAlt: guide.featuredImageAlt,
      excerpt: guide.excerpt,
      body: guide.body,
      category: guide.category,
      status: 'draft',
      publishDate: guide.publishDate ? guide.publishDate.toDate().toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
      metaTitle: guide.metaTitle ? `${guide.metaTitle} (Copy)` : '',
      metaDescription: guide.metaDescription || '',
      isFeatured: false,
      relatedProductIds: guide.relatedProductIds || [],
    });
    setIsModalOpen(true);
  };

  const handleEdit = (guide: Guide) => {
    setEditingGuide(guide);
    setImageFile(null);
    setFormData({
      title: guide.title,
      slug: guide.slug,
      featuredImage: guide.featuredImage,
      featuredImageAlt: guide.featuredImageAlt || '',
      excerpt: guide.excerpt || '',
      body: guide.body || '',
      category: guide.category || 'Self-Care',
      status: guide.status || 'draft',
      publishDate: guide.publishDate ? guide.publishDate.toDate().toISOString().slice(0, 16) : '',
      metaTitle: guide.metaTitle || '',
      metaDescription: guide.metaDescription || '',
      isFeatured: guide.isFeatured || false,
      relatedProductIds: guide.relatedProductIds || [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this guide post?")) {
      try {
        await deleteGuide(id);
        alert("Post deleted successfully.");
        loadGuides();
      } catch (err) {
        console.error(err);
        alert("Failed to delete post.");
      }
    }
  };

  const handlePreviewPost = (guide: Guide) => {
    setPreviewGuideData(guide);
    setIsPreviewOpen(true);
  };

  const handleFormPreview = () => {
    const dummyGuide = {
      id: 'preview',
      title: formData.title || 'Untitled Post',
      slug: formData.slug || 'untitled',
      featuredImage: formData.featuredImage || 'https://via.placeholder.com/800x400/000000/FFFFFF?text=Featured+Image',
      featuredImageAlt: formData.featuredImageAlt || 'Preview featured image',
      excerpt: formData.excerpt || 'This is a short preview excerpt.',
      body: formData.body || '<p>Start writing your guide...</p>',
      category: formData.category,
      status: formData.status,
      publishDate: formData.publishDate ? Timestamp.fromDate(new Date(formData.publishDate)) : Timestamp.now(),
      isFeatured: formData.isFeatured,
      relatedProductIds: formData.relatedProductIds,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    } as unknown as Guide;
    
    setPreviewGuideData(dummyGuide);
    setIsPreviewOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug) {
      alert("URL Slug is required!");
      return;
    }

    setIsSaving(true);
    try {
      const pubDate = formData.publishDate ? Timestamp.fromDate(new Date(formData.publishDate)) : Timestamp.now();
      
      const payload = {
        title: formData.title,
        slug: formData.slug,
        featuredImage: formData.featuredImage.startsWith('data:') ? '' : formData.featuredImage,
        featuredImageAlt: formData.featuredImageAlt,
        excerpt: formData.excerpt,
        body: formData.body,
        category: formData.category,
        status: formData.status,
        publishDate: pubDate,
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription || formData.excerpt,
        isFeatured: formData.isFeatured,
        relatedProductIds: formData.relatedProductIds,
      };

      if (editingGuide) {
        await updateGuide(editingGuide.id, payload, imageFile || undefined);
        alert("Guide updated successfully!");
      } else {
        // Check slug uniqueness
        const existing = guides.find(g => g.slug === formData.slug);
        if (existing) {
          throw new Error("A post with this URL slug already exists. Please use a unique slug.");
        }
        await createGuide(payload, imageFile || undefined);
        alert("Guide created successfully!");
      }

      setIsModalOpen(false);
      setEditingGuide(null);
      setImageFile(null);
      setFormData({
        title: '',
        slug: '',
        featuredImage: '',
        featuredImageAlt: '',
        excerpt: '',
        body: '',
        category: 'Self-Care',
        status: 'draft',
        publishDate: '',
        metaTitle: '',
        metaDescription: '',
        isFeatured: false,
        relatedProductIds: [],
      });
      loadGuides();
    } catch (error) {
      console.error('Error saving guide:', error);
      alert(`Failed to save guide: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter & Search Logic
  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guide.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guide.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategoryFilter === 'All' || guide.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* CMS Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-2">Guides & Articles</h2>
          <p className="text-white/40">Write, edit, and publish content for your blog homepage.</p>
        </div>
        <button
          onClick={() => {
            setEditingGuide(null);
            setImageFile(null);
            setFormData({
              title: '',
              slug: '',
              featuredImage: '',
              featuredImageAlt: '',
              excerpt: '',
              body: '',
              category: 'Self-Care',
              status: 'draft',
              publishDate: new Date().toISOString().slice(0, 16),
              metaTitle: '',
              metaDescription: '',
              isFeatured: false,
              relatedProductIds: [],
            });
            setIsModalOpen(true);
          }}
          className="px-6 py-3 bg-primary text-white font-bold rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus size={20} />
          Create Post
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
          <span className="text-xs uppercase tracking-widest font-bold text-white/30 mr-2 hidden md:inline">Category:</span>
          <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
            {['All', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategoryFilter === cat
                    ? "bg-primary text-white"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Listing */}
      {loading ? (
        <div className="py-24 text-center text-white/40">Loading guides...</div>
      ) : filteredGuides.length === 0 ? (
        <div className="py-24 text-center text-white/40 bg-zinc-900 border border-white/10 rounded-[2.5rem]">
          No guides found. Create a new guide post to get started.
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Article</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Category</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Publish Date</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40">Status</th>
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-white/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuides.map((guide) => (
                <tr key={guide.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      {guide.featuredImage ? (
                    <Image src={guide.featuredImage} alt="" className="w-12 h-12 rounded-lg object-cover" width={48} height={48} unoptimized />
                      ) : (
                        <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-white/30"><FileText size={18} /></div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{guide.title}</span>
                          {guide.isFeatured && (
                            <span className="px-2 py-0.5 bg-primary/20 text-primary text-[8px] font-bold uppercase tracking-wider rounded-full border border-primary/20">
                              Featured
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-white/40">/guides/{guide.slug}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-white/60 text-sm">{guide.category}</td>
                  <td className="p-6 text-white/60 text-sm">
                    {guide.publishDate ? guide.publishDate.toDate().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/A'}
                  </td>
                  <td className="p-6">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      guide.status === 'published' && guide.publishDate.toDate() <= new Date()
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : guide.status === 'published'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-zinc-700/20 text-white/40 border border-white/10'
                    }`}>
                      {guide.status === 'published' && guide.publishDate.toDate() <= new Date()
                        ? 'Published'
                        : guide.status === 'published'
                        ? 'Scheduled'
                        : 'Draft'}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handlePreviewPost(guide)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                        title="Preview Post"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDuplicate(guide)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                        title="Duplicate Post"
                      >
                        <Copy size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(guide)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(guide.id)}
                        className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-primary transition-colors"
                        title="Delete"
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
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (window.confirm("Any unsaved changes will be lost. Close?")) {
                  setIsModalOpen(false);
                }
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Any unsaved changes will be lost. Close?")) {
                    setIsModalOpen(false);
                  }
                }}
                className="absolute top-8 right-8 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <h2 className="text-3xl font-display font-bold">
                  {editingGuide ? 'Edit Guide Post' : 'Create New Guide'}
                </h2>
                <button
                  type="button"
                  onClick={handleFormPreview}
                  className="px-4 py-1.5 border border-white/15 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold flex items-center gap-1.5 text-white/80 transition-colors"
                >
                  <Eye size={14} /> Full Public Preview
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Title</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. A Beginner's Guide to Self-Care"
                      value={formData.title}
                      onChange={handleTitleChange}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">URL Slug</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. beginners-guide-self-care"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors text-white"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat} value={cat} className="bg-zinc-950 text-white">{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Publish Date & Time (Scheduler)</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-4 top-4 text-white/30 pointer-events-none" />
                      <input
                        required
                        type="datetime-local"
                        value={formData.publishDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                        className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Excerpt / Summary */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Excerpt / Summary (Short description showing on listing card)</label>
                  <textarea
                    required
                    maxLength={200}
                    placeholder="Enter a brief, engaging summary of this article..."
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors text-white min-h-[80px] max-h-[120px] resize-y"
                  />
                  <div className="text-right text-[10px] text-white/30 uppercase tracking-widest">{formData.excerpt.length}/200 chars</div>
                </div>

                {/* Images (Cloudinary) */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Featured Image</label>
                    <div className="space-y-4">
                      <label className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary transition-colors cursor-pointer flex items-center justify-center gap-2">
                        <Upload size={18} />
                        <span>{imageFile ? imageFile.name : 'Choose featured image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      
                      {formData.featuredImage && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10">
                          <div className="relative w-full h-full min-h-[160px]">
                            <Image src={formData.featuredImage} alt="Featured Preview" className="object-cover" fill unoptimized />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Featured Image Alt Text (SEO & Accessibility)</label>
                    <input
                      required={!!formData.featuredImage}
                      type="text"
                      placeholder="e.g. A couple sharing a romantic massage outdoors"
                      value={formData.featuredImageAlt}
                      onChange={(e) => setFormData(prev => ({ ...prev, featuredImageAlt: e.target.value }))}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors text-white"
                    />
                  </div>
                </div>

                <MarkdownEditor
                  label="Article Body Editor (Markdown)"
                  placeholder="Write your guide content here in Markdown..."
                  value={formData.body}
                  onChange={(val) => setFormData(prev => ({ ...prev, body: val }))}
                  minHeight="350px"
                />

                {/* Related Products Picker */}
                <div className="space-y-4 border border-white/10 rounded-3xl p-6 bg-white/5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-white/40">Tasteful Call To Action: Link store products</label>
                    <p className="text-xs text-white/30">Linked products will show at the bottom of the article as a subtle, on-brand recommendation carousel.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-[180px] overflow-y-auto pr-2">
                    {products.map(prod => {
                      const isSelected = formData.relatedProductIds.includes(prod.id);
                      return (
                        <button
                          type="button"
                          key={prod.id}
                          onClick={() => handleProductToggle(prod.id)}
                          className={`p-3 border rounded-xl flex items-center gap-3 text-left transition-all ${
                            isSelected 
                              ? 'bg-primary/10 border-primary text-white' 
                              : 'bg-zinc-950 border-white/10 hover:border-white/30 text-white/60'
                          }`}
                        >
                          <Image src={prod.image} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" width={32} height={32} unoptimized />
                          <div className="truncate">
                            <p className="text-xs font-bold truncate">{prod.name}</p>
                            <p className="text-[10px] text-white/30 font-mono">GHS {prod.price.toFixed(2)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SEO Configuration & Options */}
                <div className="space-y-4 border border-white/10 rounded-3xl p-6 bg-white/5">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40 block pb-2 border-b border-white/10">SEO Fields & Flags</label>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Meta Title</label>
                      <input
                        type="text"
                        placeholder="Leave blank to use article title"
                        value={formData.metaTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Meta Description</label>
                      <input
                        type="text"
                        placeholder="Leave blank to use excerpt"
                        value={formData.metaDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors text-white"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 pt-2">
                    <div
                      className="flex items-center gap-3 p-4 bg-zinc-950 border border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setFormData(prev => ({ ...prev, isFeatured: !prev.isFeatured }))}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.isFeatured ? 'bg-primary border-primary' : 'border-white/20'}`}>
                        {formData.isFeatured && <X size={12} className="text-white" />}
                      </div>
                      <span className="text-xs font-bold text-white/80">Highlight as Featured Post</span>
                    </div>

                    <div
                      className="flex items-center gap-3 p-4 bg-zinc-950 border border-white/10 rounded-2xl cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => setFormData(prev => ({ ...prev, status: prev.status === 'published' ? 'draft' : 'published' }))}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${formData.status === 'published' ? 'bg-primary border-primary' : 'border-white/20'}`}>
                        {formData.status === 'published' && <X size={12} className="text-white" />}
                      </div>
                      <span className="text-xs font-bold text-white/80">Set Status to Published</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Discard all changes?")) {
                        setIsModalOpen(false);
                      }
                    }}
                    className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl hover:scale-[1.01] active:scale-95 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      editingGuide ? 'Save Updates' : 'Publish / Create'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Public Preview Dialog */}
      <AnimatePresence>
        {isPreviewOpen && previewGuideData && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="absolute inset-0 bg-black/95"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-zinc-950 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="absolute top-6 right-6 p-2 bg-black border border-white/10 rounded-full hover:bg-white/10 text-white transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="max-w-2xl mx-auto font-sans">
                <div className="text-center mb-6">
                  <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest rounded-full">
                    {previewGuideData.category}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-2 leading-tight">
                    {previewGuideData.title}
                  </h1>
                  <div className="flex items-center justify-center gap-4 text-xs text-white/40 mt-4">
                    <span>{previewGuideData.publishDate?.toDate()?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>10 mins read</span>
                  </div>
                </div>

                {previewGuideData.featuredImage && (
                  <div className="aspect-video rounded-3xl overflow-hidden mb-8 border border-white/10 relative">
                    <Image src={previewGuideData.featuredImage} alt={previewGuideData.featuredImageAlt || ""} className="object-cover" fill unoptimized />
                  </div>
                )}

                <div className="rich-text-content mb-12" dangerouslySetInnerHTML={{ __html: parseMarkdown(previewGuideData.body) }} />

                {/* Render Related Products CTA Mockup if present */}
                {previewGuideData.relatedProductIds?.length > 0 && (
                  <div className="pt-8 border-t border-white/10">
                    <h3 className="text-xl font-display font-bold mb-4 uppercase tracking-wider text-white/60">Featured Products in this Guide</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {products.filter(p => previewGuideData.relatedProductIds.includes(p.id)).map(prod => (
                        <div key={prod.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-4">
                          <Image src={prod.image} alt="" className="w-12 h-12 rounded-lg object-cover" width={48} height={48} unoptimized />
                          <div>
                            <p className="font-bold text-sm">{prod.name}</p>
                            <p className="text-xs text-emerald-400 font-bold">GHS {prod.price.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

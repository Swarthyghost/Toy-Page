"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Calendar, BookOpen, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { fetchPublishedGuides, Guide } from '../../services/firebaseApi';
import { useSEO } from '../../hooks/useSEO';

const CATEGORIES = ["Self-Care", "Beginner Guides", "Product Education", "Wellness Tips"];
const POSTS_PER_PAGE = 6;

const GuideCardSkeleton = () => (
  <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden animate-pulse">
    <div className="relative aspect-[16/10] bg-white/10" />
    <div className="p-6 space-y-4">
      <div className="h-4 bg-white/10 rounded-lg w-1/4" />
      <div className="space-y-2">
        <div className="h-6 bg-white/10 rounded-lg w-3/4" />
        <div className="h-4 bg-white/5 rounded-lg w-full" />
        <div className="h-4 bg-white/5 rounded-lg w-5/6" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="h-4 bg-white/10 rounded-lg w-1/3" />
        <div className="h-4 bg-white/10 rounded-lg w-1/4" />
      </div>
    </div>
  </div>
);

export default function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);

  useEffect(() => {
    const loadGuidesData = async () => {
      try {
        const data = await fetchPublishedGuides();
        setGuides(data);
      } catch (err) {
        console.error("Error loading blog posts:", err);
      } finally {
        setLoading(false);
      }
    };
    loadGuidesData();
  }, []);

  useSEO({
    title: activeCategory === 'All' ? 'Guides & Wellness Articles' : `${activeCategory} Guides`,
    description: activeCategory === 'All'
      ? "Explore PleasureToys GH's educational wellness guides, beginner product tutorials, and expert self-care tips for premium adult lifestyle in Ghana."
      : `Read premium articles and guides on ${activeCategory} to elevate your pleasure and self-care journey. 100% discreet advice and insights.`,
    url: `/guides`,
  });

  // Calculate reading time on the fly
  const calculateReadTime = (htmlContent: string) => {
    const wordsPerMinute = 200;
    const text = htmlContent ? htmlContent.replace(/<[^>]*>/g, '') : '';
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    return Math.ceil(wordCount / wordsPerMinute) || 1;
  };

  // 1. Featured Post: First featured post, or fallback to first published post
  const featuredPost = useMemo(() => {
    if (guides.length === 0) return null;
    const featured = guides.find(g => g.isFeatured);
    return featured || guides[0];
  }, [guides]);

  // 2. Regular Posts (excluding the main featured post, if it's shown in the featured hero section)
  const remainingPosts = useMemo(() => {
    if (guides.length <= 1) return [];
    const featuredId = featuredPost?.id;
    return guides.filter(g => g.id !== featuredId);
  }, [guides, featuredPost]);

  // 3. Filtered list for cards (excluding the main featured post if we are on 'All' category)
  const filteredPosts = useMemo(() => {
    // If a category is selected, we filter ALL guides by that category
    if (activeCategory !== 'All') {
      return guides.filter(g => g.category === activeCategory);
    }
    // If 'All' is selected, we display the remaining posts (with featured post highlighted separately at the top)
    return remainingPosts;
  }, [activeCategory, guides, remainingPosts]);

  // Paginated list based on visibleCount
  const paginatedPosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + POSTS_PER_PAGE);
  };

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(POSTS_PER_PAGE); // Reset pagination on filter change
  };

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* Banner/Header */}
        <div className="text-center py-12 md:py-16 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight mb-4">
            Guides & <span className="text-primary">Articles</span>
          </h1>
          <p className="text-white/60 text-sm md:text-base leading-relaxed">
            Tasteful, self-care-focused education on relationships, wellness, and product guides. Elevate your intimacy knowledge with pleasure-positive insights.
          </p>
        </div>

        {/* Featured Post Header Section (Only shown on 'All' and when not loading) */}
        {!loading && activeCategory === 'All' && featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-16 bg-zinc-900/40 border border-white/10 rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all group"
          >
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 aspect-[16/10] md:aspect-auto md:h-[400px] overflow-hidden relative">
                {featuredPost.featuredImage ? (
                  <img
                    src={featuredPost.featuredImage}
                    alt={featuredPost.featuredImageAlt}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20">
                    <BookOpen size={48} />
                  </div>
                )}
                <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                  Featured Article
                </div>
              </div>

              <div className="md:col-span-5 p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-3 text-xs text-white/50">
                  <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-full font-bold uppercase tracking-widest text-white/80">
                    {featuredPost.category}
                  </span>
                  <span>•</span>
                  <span>{calculateReadTime(featuredPost.body)} min read</span>
                </div>
                
                <h2 className="text-2xl md:text-4xl font-display font-bold group-hover:text-primary transition-colors leading-tight">
                  <Link href={`/guides/${featuredPost.slug}`}>
                    {featuredPost.title}
                  </Link>
                </h2>
                
                <p className="text-white/60 text-sm md:text-base leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-white/40 flex items-center gap-1.5">
                    <Calendar size={14} />
                    {featuredPost.publishDate?.toDate()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <Link
                    href={`/guides/${featuredPost.slug}`}
                    className="inline-flex items-center gap-1 text-primary text-sm font-bold hover:underline"
                  >
                    Read Guide <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Category Filters bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/5">
          <h2 className="text-xl md:text-2xl font-display font-bold">
            {activeCategory === 'All' ? 'Latest Guides' : `${activeCategory} Articles`}
          </h2>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 max-w-full no-scrollbar">
            <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
              {['All', ...CATEGORIES].map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? "bg-primary text-white shadow-lg shadow-primary/20"
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button className="p-2.5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 text-white/60 transition-colors">
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Guides Cards Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <GuideCardSkeleton key={`skeleton-${i}`} />
              ))
            ) : paginatedPosts.length > 0 ? (
              paginatedPosts.map((post) => (
                <motion.article
                  layout
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -6 }}
                  className="group bg-zinc-900/30 border border-white/10 rounded-3xl overflow-hidden hover:bg-zinc-900/60 hover:border-primary/40 transition-all flex flex-col h-full"
                >
                  <Link href={`/guides/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden bg-zinc-950">
                    {post.featuredImage ? (
                      <img
                        src={post.featuredImage}
                        alt={post.featuredImageAlt}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <FileText size={32} />
                      </div>
                    )}
                    <span className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-widest rounded-full">
                      {post.category}
                    </span>
                  </Link>

                  <div className="p-6 flex flex-col flex-grow space-y-4">
                    <h3 className="text-lg md:text-xl font-bold font-display group-hover:text-primary transition-colors line-clamp-2">
                      <Link href={`/guides/${post.slug}`}>{post.title}</Link>
                    </h3>
                    
                    <p className="text-white/40 text-xs md:text-sm leading-relaxed line-clamp-3 flex-grow">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[11px] text-white/40 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        {post.publishDate?.toDate()?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span>{calculateReadTime(post.body)} min read</span>
                    </div>
                  </div>
                </motion.article>
              ))
            ) : null}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {!loading && filteredPosts.length === 0 && (
          <div className="py-24 text-center">
            <BookOpen size={48} className="mx-auto mb-4 text-white/20 animate-bounce" />
            <h3 className="text-xl font-display font-bold mb-2">No articles found</h3>
            <p className="text-white/40 max-w-sm mx-auto text-sm">
              We haven't published any articles in this category yet. Click "All" to browse other guides or check back later!
            </p>
          </div>
        )}

        {/* Load More Button */}
        {!loading && filteredPosts.length > visibleCount && (
          <div className="flex justify-center mt-16">
            <button
              onClick={handleLoadMore}
              className="px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl transition-colors hover:border-white/20"
            >
              Load More Articles
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

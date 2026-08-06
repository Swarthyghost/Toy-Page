"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Share2, ArrowLeft, Send, Check } from 'lucide-react';
import { fetchGuideBySlug, fetchPublishedGuides, Guide } from '../../../services/firebaseApi';
import { useProducts } from '../../../context/ProductContext';
import { useSEO } from '../../../hooks/useSEO';
import { parseMarkdown } from '../../../utils/markdown';
import { slugify } from '../../../utils/seoHelper';

export default function GuideDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const { products } = useProducts();

  const [guide, setGuide] = useState<Guide | null>(null);
  const [allGuides, setAllGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    if (!slug) return;
    
    const loadGuideData = async () => {
      setLoading(true);
      try {
        const post = await fetchGuideBySlug(slug);
        if (post) {
          setGuide(post);
        } else {
          // If post doesn't exist or slug is wrong, route to 404/Guides
          router.replace('/guides');
        }
        
        // Load other guides for the "Related Posts" section
        const published = await fetchPublishedGuides();
        setAllGuides(published);
      } catch (err) {
        console.error("Failed to load guide details:", err);
      } finally {
        setLoading(false);
      }
    };

    loadGuideData();
  }, [slug, router]);

  // Set page SEO metadata
  useSEO({
    title: guide?.metaTitle || guide?.title,
    description: guide?.metaDescription || guide?.excerpt,
    image: guide?.featuredImage,
    url: `/guides/${slug}`,
    type: 'article',
  });

  // Calculate dynamic reading time on the fly
  const readTime = useMemo(() => {
    if (!guide?.body) return 1;
    const wordsPerMinute = 200;
    const text = guide.body.replace(/<[^>]*>/g, '');
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    return Math.ceil(wordCount / wordsPerMinute) || 1;
  }, [guide?.body]);

  // Filter 3 related guides in the same category (excluding current post)
  const relatedGuides = useMemo(() => {
    if (!guide) return [];
    return allGuides
      .filter(g => g.category === guide.category && g.id !== guide.id)
      .slice(0, 3);
  }, [allGuides, guide]);

  // Lookup the details of recommended products linked to this guide
  const recommendedProducts = useMemo(() => {
    if (!guide?.relatedProductIds || guide.relatedProductIds.length === 0) return [];
    return products.filter(p => guide.relatedProductIds.includes(p.id));
  }, [products, guide?.relatedProductIds]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleShareTwitter = () => {
    if (!guide) return;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(guide.title)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    if (!guide) return;
    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(guide.title + ' - ' + window.location.href)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!guide) return null;

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-20">
      
      {/* Schema.org BlogPosting Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": guide.title,
            "image": guide.featuredImage ? [guide.featuredImage] : ["https://pleasuretoysgh.com/toy-og.png"],
            "datePublished": guide.publishDate?.toDate().toISOString(),
            "dateModified": guide.updatedAt?.toDate().toISOString() || guide.publishDate?.toDate().toISOString(),
            "author": [{
              "@type": "Organization",
              "name": "PleasureToys GH",
              "url": "https://pleasuretoysgh.com"
            }],
            "publisher": {
              "@type": "Organization",
              "name": "PleasureToys GH",
              "logo": {
                "@type": "ImageObject",
                "url": "https://pleasuretoysgh.com/toy-og.png"
              }
            },
            "description": guide.excerpt,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://pleasuretoysgh.com/guides/${guide.slug}`
            }
          })
        }}
      />

      <article className="max-w-4xl mx-auto px-4 md:px-6">
        
        {/* Back Link */}
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider mb-8 group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Guides
        </Link>

        {/* Post Title & Category Header */}
        <div className="text-center md:text-left mb-10 space-y-4">
          <span className="px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest rounded-full">
            {guide.category}
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-bold leading-tight mt-4">
            {guide.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs text-white/40 pt-2 border-t border-white/5 font-medium uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {guide.publishDate?.toDate()?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {readTime} Min Read
            </span>
          </div>
        </div>

        {/* Large Featured Image */}
        {guide.featuredImage && (
           <div className="aspect-[21/9] rounded-[2rem] overflow-hidden border border-white/10 mb-12 shadow-2xl relative">
             <Image
               src={guide.featuredImage}
               alt={guide.featuredImageAlt || "Featured Image"}
               className="object-cover"
               fill
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
               priority
             />
           </div>
         )}

        {/* Layout with Article Body & Social Share side rail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Article Main Body */}
          <div className="lg:col-span-9 space-y-8">
            <div
              className="rich-text-content prose prose-invert max-w-none prose-headings:font-display"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(guide.body) }}
            />
            
            {/* Call To Action: Linked Products */}
            {recommendedProducts.length > 0 && (
              <div className="bg-zinc-900/30 border border-white/10 rounded-[2rem] p-6 md:p-8 mt-16 space-y-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Self-Care Essentials</span>
                  <h2 className="text-xl md:text-2xl font-display font-bold">Featured Products from this Guide</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {recommendedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:border-primary/50 transition-colors group"
                    >
                       <Image
                         src={product.image}
                         alt={product.name}
                         className="w-16 h-16 rounded-xl object-cover border border-white/10 flex-shrink-0"
                         width={64}
                         height={64}
                       />
                      <div className="min-w-0 flex-grow">
                        <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">
                          <Link href={`/product/${slugify(product.name)}`}>
                            {product.name}
                          </Link>
                        </h3>
                        <p className="text-xs text-white/40 line-clamp-1 mb-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-emerald-400 font-bold font-display">GHS {product.price.toFixed(2)}</span>
                          <Link
                            href={`/product/${slugify(product.name)}`}
                            className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                          >
                            View {product.name}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Social Share Rails */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 h-fit border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-8 space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
              <Share2 size={14} /> Share Article
            </div>
            
            <div className="flex lg:flex-col gap-3 flex-wrap">
              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-white hover:text-emerald-400 rounded-xl transition-all text-xs font-bold w-full lg:w-auto"
              >
                <Send size={14} /> WhatsApp
              </button>
              
              <button
                onClick={handleShareTwitter}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all text-xs font-bold w-full lg:w-auto"
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter / X
              </button>

              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl transition-all text-xs font-bold w-full lg:w-auto"
              >
                {copiedShare ? (
                  <>
                    <Check size={14} className="text-green-400" />
                    <span className="text-green-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Related Posts Section */}
        {relatedGuides.length > 0 && (
          <div className="pt-16 mt-20 border-t border-white/10 space-y-8">
            <h2 className="text-2xl font-display font-bold">Related Guides</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedGuides.map((item) => (
                <div
                  key={item.id}
                  className="bg-zinc-900/30 border border-white/10 rounded-2xl overflow-hidden hover:border-primary/40 transition-colors flex flex-col group"
                >
                  <Link href={`/guides/${item.slug}`} className="block relative aspect-video overflow-hidden">
                    {item.featuredImage ? (
                       <Image
                         src={item.featuredImage}
                         alt={item.featuredImageAlt || "Guide thumbnail"}
                         className="object-cover group-hover:scale-105 transition-transform duration-500"
                         fill
                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 350px"
                       />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center text-white/20">
                        <Calendar size={24} />
                      </div>
                    )}
                  </Link>
                  <div className="p-4 flex flex-col flex-grow space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">{item.category}</span>
                    <h3 className="font-bold text-base font-display line-clamp-1 group-hover:text-primary transition-colors">
                      <Link href={`/guides/${item.slug}`}>{item.title}</Link>
                    </h3>
                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed flex-grow">
                      {item.excerpt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </article>
    </div>
  );
}

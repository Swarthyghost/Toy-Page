import { MetadataRoute } from 'next';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { slugify } from '../utils/seoHelper';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pleasuretoysgh.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/category/Vibrators`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/category/BDSM`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/category/Lubricants`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/category/Mens%20Toy`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/category/Accessories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
    { url: `${baseUrl}/shipping`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/guides`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/delivery-information`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/adult-toy-safety-guide`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 }
  ];

  // Dynamic guides
  const guidePages: MetadataRoute.Sitemap = [];
  try {
    const q = query(
      collection(db, 'guides'),
      where('status', '==', 'published')
    );
    const querySnapshot = await getDocs(q);
    const now = new Date();
    
    const publishedGuides = querySnapshot.docs
      .map(doc => doc.data())
      .filter(guide => {
        const pubDate = guide.publishDate?.toDate();
        return pubDate && pubDate <= now;
      });

    for (const guide of publishedGuides) {
      if (guide.slug) {
        guidePages.push({
          url: `${baseUrl}/guides/${guide.slug}`,
          lastModified: guide.updatedAt ? guide.updatedAt.toDate() : new Date(),
          changeFrequency: 'weekly',
          priority: 0.7
        });
      }
    }
  } catch (error) {
    console.error('Error fetching guides for sitemap:', error);
  }

  // Dynamic products
  const productPages: MetadataRoute.Sitemap = [];
  try {
    const q = query(collection(db, 'products'), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id } as any))
      .filter(product => !product.hide_product);

    for (const product of products) {
      productPages.push({
        url: `${baseUrl}/product/${slugify(product.name)}`,
        lastModified: product.updatedAt ? product.updatedAt.toDate() : new Date(),
        changeFrequency: 'weekly',
        priority: 0.8
      });
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  return [...staticPages, ...guidePages, ...productPages];
}

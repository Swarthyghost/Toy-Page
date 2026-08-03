import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = 'https://pleasuretoysgh.com';
  
  // Static pages
  const staticPages = [
    { loc: '', changefreq: 'daily', priority: '1.0' },
    { loc: '/category/Vibrators', changefreq: 'weekly', priority: '0.9' },
    { loc: '/category/BDSM', changefreq: 'weekly', priority: '0.9' },
    { loc: '/category/Lubricants', changefreq: 'weekly', priority: '0.8' },
    { loc: '/category/Mens%20Toy', changefreq: 'weekly', priority: '0.8' },
    { loc: '/category/Accessories', changefreq: 'weekly', priority: '0.8' },
    { loc: '/about', changefreq: 'monthly', priority: '0.6' },
    { loc: '/contact', changefreq: 'yearly', priority: '0.5' },
    { loc: '/shipping', changefreq: 'yearly', priority: '0.4' },
    { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
    { loc: '/guides', changefreq: 'daily', priority: '0.8' },
    { loc: '/faq', changefreq: 'weekly', priority: '0.8' },
    { loc: '/delivery-information', changefreq: 'weekly', priority: '0.8' },
    { loc: '/privacy-policy', changefreq: 'weekly', priority: '0.8' },
    { loc: '/adult-toy-safety-guide', changefreq: 'weekly', priority: '0.8' }
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Add static pages
  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }

  // Fetch published guides
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
        xml += `
  <url>
    <loc>${baseUrl}/guides/${guide.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }
  } catch (error) {
    console.error('Error fetching guides for sitemap:', error);
  }

  // Fetch products
  try {
    const q = query(collection(db, 'products'), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs
      .map(doc => ({ ...doc.data(), id: doc.id } as any))
      .filter(product => !product.hide_product);

    for (const product of products) {
      xml += `
  <url>
    <loc>${baseUrl}/product/${product.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  xml += `\n</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600'
    }
  });
}

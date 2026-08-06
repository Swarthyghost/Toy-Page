import { MetadataRoute } from 'next';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://pleasuretoysgh.com';
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
          lastModified: guide.updatedAt ? guide.updatedAt.toDate() : (guide.publishDate ? guide.publishDate.toDate() : new Date()),
          changeFrequency: 'weekly',
          priority: 0.8
        });
      }
    }
  } catch (error) {
    console.error('Error fetching guides for dynamic guides sitemap:', error);
  }

  return guidePages;
}

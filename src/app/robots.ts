import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',
        '/admin-login',
        '/api/',
        '/cart',
        '/dashboard',
        '/checkout',
      ],
    },
    sitemap: [
      'https://pleasuretoysgh.com/sitemap.xml',
      'https://pleasuretoysgh.com/guides/sitemap.xml'
    ],
  };
}

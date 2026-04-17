// src/hooks/useSEO.ts
// Drop this file into src/hooks/ and call it at the top of any page component.
// It dynamically updates <title>, meta description, og tags, etc.

import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const BASE_TITLE = "PleasureToys GH";
const BASE_DESCRIPTION =
  "Ghana's premier destination for high-quality adult toys, vibrators, BDSM gear, lubricants and accessories. 100% discreet packaging, fast delivery across Ghana.";
const BASE_KEYWORDS =
  "adult toys Ghana, sex toys Accra, vibrators Ghana, BDSM gear, lubricants, mens toys, discreet delivery, pleasure toys, adult shop Ghana, sex accessories";
const BASE_URL = "https://pleasuretoysgh.com";
const BASE_IMAGE = `${BASE_URL}/toy-og.png`;

export function useSEO({
  title,
  description = BASE_DESCRIPTION,
  keywords = BASE_KEYWORDS,
  image = BASE_IMAGE,
  url,
  type = "website",
}: SEOProps = {}) {
  const fullTitle = title
    ? `${title} | ${BASE_TITLE}`
    : `${BASE_TITLE} | Premium Adult Toys & Accessories in Ghana`;
  const fullUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Helper to set or create a meta tag
    const setMeta = (selector: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        const attr = selector.includes("[name") ? "name" : "property";
        const val = selector.match(/["']([^"']+)["']/)?.[1] ?? "";
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(
        `link[rel="${rel}"]`,
      ) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    setMeta('meta[name="description"]', description);
    setMeta('meta[name="keywords"]', keywords);
    setLink("canonical", fullUrl);

    // Open Graph
    setMeta('meta[property="og:title"]', fullTitle);
    setMeta('meta[property="og:description"]', description);
    setMeta('meta[property="og:url"]', fullUrl);
    setMeta('meta[property="og:image"]', image);
    setMeta('meta[property="og:type"]', type);

    // Twitter
    setMeta('meta[name="twitter:title"]', fullTitle);
    setMeta('meta[name="twitter:description"]', description);
    setMeta('meta[name="twitter:image"]', image);
    setMeta('meta[name="twitter:url"]', fullUrl);
  }, [fullTitle, description, keywords, image, fullUrl, type]);
}

// ─── Usage examples ──────────────────────────────────────────────────────────
//
// In Hero / Homepage:
//   useSEO();
//
// In ProductListing for a category:
//   useSEO({
//     title: 'Vibrators',
//     description: 'Shop premium vibrators in Ghana. Fast, discreet delivery.',
//     url: '/category/Vibrators',
//   });
//
// In ProductDetail:
//   useSEO({
//     title: product.name,
//     description: product.description,
//     image: product.image,
//     url: `/product/${product.id}`,
//     type: 'product',
//   });
//
// In About:
//   useSEO({ title: 'Our Story', url: '/about' });
//
// In Contact:
//   useSEO({ title: 'Contact Us', url: '/contact' });

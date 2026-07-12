/**
 * Utility functions for image optimization.
 */

/**
 * Optimizes Unsplash product URLs to output WebP and target specific widths and quality.
 */
export function getProductWebpUrl(url: string, width = 800): string {
  if (!url) return url;
  if (url.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set("fm", "webp");
      urlObj.searchParams.set("q", "80");
      urlObj.searchParams.set("w", width.toString());
      urlObj.searchParams.delete("auto");
      urlObj.searchParams.set("fit", "crop");
      return urlObj.toString();
    } catch (e) {
      return url;
    }
  }
  return url;
}

/**
 * Generates a responsive srcSet for Unsplash product images.
 */
export function getProductSrcSet(url: string): string | undefined {
  if (!url) return undefined;
  if (url.includes("images.unsplash.com")) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.delete("w");
      urlObj.searchParams.delete("q");
      urlObj.searchParams.delete("fm");
      urlObj.searchParams.delete("auto");
      urlObj.searchParams.set("fit", "crop");
      const baseUrl = urlObj.toString();
      
      const separator = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${separator}fm=webp&q=80&w=400 400w, ${baseUrl}${separator}fm=webp&q=80&w=800 800w, ${baseUrl}${separator}fm=webp&q=80&w=1200 1200w`;
    } catch (e) {
      return undefined;
    }
  }
  return undefined;
}

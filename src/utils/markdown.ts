import { marked } from 'marked';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true, // Converts \n to <br>
});

/**
 * Parses markdown/MDX strings into HTML safely.
 * Since marked natively passes HTML through, this preserves 
 * backward compatibility for any existing HTML content.
 */
export const parseMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  try {
    return marked.parse(markdown) as string;
  } catch (err) {
    console.error('Failed to parse markdown:', err);
    return markdown;
  }
};

/**
 * Strips markdown syntax down to plain text, for short card-preview excerpts
 * where rendering full HTML (headings, lists) isn't appropriate.
 */
export const stripMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  return markdown
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

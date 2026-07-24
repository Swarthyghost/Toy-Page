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

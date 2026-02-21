/**
 * Simple markdown sanitizer - strips common markdown syntax for plain text display
 */
export function stripMarkdown(text: string): string {
  if (!text) return "";
  
  return text
    // Remove headers (# ## ### etc)
    .replace(/^#{1,6}\s+/gm, "")
    // Remove bold **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    // Remove italic *text* or _text_
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    // Remove inline code `code`
    .replace(/`([^`]+)`/g, "$1")
    // Remove code blocks ```code```
    .replace(/```[\s\S]*?```/g, "")
    // Remove links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    // Remove blockquotes
    .replace(/^>\s+/gm, "")
    // Remove horizontal rules
    .replace(/^---+$/gm, "")
    .replace(/^\*\*\*+$/gm, "")
    // Remove bullet points
    .replace(/^[\*\-\+]\s+/gm, "")
    // Remove numbered lists
    .replace(/^\d+\.\s+/gm, "")
    // Clean up extra whitespace
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Truncate text to a maximum length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 150): string {
  const stripped = stripMarkdown(text);
  if (stripped.length <= maxLength) return stripped;
  return stripped.slice(0, maxLength).trim() + "...";
}

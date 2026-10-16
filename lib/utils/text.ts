/**
 * Compares an excerpt against a title to determine if the excerpt provides new information.
 * Returns false if the excerpt is empty, matches the title, or merely repeats the title.
 */
export function shouldRenderExcerpt(title: string, excerpt?: string): boolean {
  if (!excerpt) return false;

  const rawExcerpt = excerpt.trim();
  if (rawExcerpt.length === 0) return false;

  const normalize = (text: string): string =>
    text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const normTitle = normalize(title);
  const normExcerpt = normalize(rawExcerpt);

  if (!normExcerpt || normExcerpt.length === 0) return false;
  if (normExcerpt === normTitle) return false;

  // Hide if excerpt is a prefix of title or vice-versa
  if (normTitle.startsWith(normExcerpt) || normExcerpt.startsWith(normTitle)) {
    // If the difference in length is small (e.g. trailing ellipsis or punctuation), hide
    const lenDiff = Math.abs(normExcerpt.length - normTitle.length);
    if (lenDiff <= 30) return false;
  }

  // Tokenize and check if excerpt is essentially identical to title tokens
  const titleTokens = new Set(normTitle.split(' ').filter((w) => w.length > 2));
  const excerptTokens = normExcerpt.split(' ').filter((w) => w.length > 2);
  
  if (excerptTokens.length > 0) {
    const newWords = excerptTokens.filter((w) => !titleTokens.has(w));
    // If excerpt doesn't add at least 3 distinct meaningful words, consider it redundant
    if (newWords.length < 3 && normExcerpt.length < normTitle.length + 20) {
      return false;
    }
  }

  return true;
}

/**
 * Applies exponential recency decay to an engagement score.
 * A 36-hour half-life balances freshness with timeless editorial quality.
 */
export function applyRecencyDecay(
  engagementScore: number,
  publishedAt: string,
  halfLifeHours = 36
): number {
  const publishedDate = new Date(publishedAt).getTime();
  const now = Date.now();
  const ageInHours = Math.max(0, (now - publishedDate) / (1000 * 60 * 60));

  // Decay factor: halving score every halfLifeHours
  const decayFactor = Math.pow(0.5, ageInHours / halfLifeHours);

  // Maintain a minimum baseline score (15%) so older landmark posts don't vanish entirely
  const effectiveDecay = 0.15 + 0.85 * decayFactor;

  return engagementScore * effectiveDecay;
}

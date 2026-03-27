/**
 * Shared element transition utilities and naming conventions.
 *
 * ## sharedTransitionTag naming convention
 *
 * Format: `{feature}.{component}.{identifier}`
 *
 * Examples:
 * - `feed.post.image-{postId}`
 * - `strains.card.image-{strainId}`
 * - `garden.plant.avatar`
 * - `settings.avatar`
 *
 * Prefix tags by feature to avoid collisions across screens.
 * Use consistent prefixes so hooks/transitions remain discoverable.
 */

/** Build a scoped shared transition tag */
export function sharedTag(
  feature: string,
  component: string,
  id?: string
): string {
  const base = `${feature}.${component}`;
  return id ? `${base}-${id}` : base;
}

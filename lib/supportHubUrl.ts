/**
 * URL helpers for linking out to the unified DNA Match Support hub
 * (https://genomelink-support-hub.vercel.app).
 *
 * Set NEXT_PUBLIC_SUPPORT_HUB_URL in `.env.local` to point at a different
 * deployment (e.g. http://localhost:3013 during dev).
 */
export const SUPPORT_HUB_BASE =
  process.env.NEXT_PUBLIC_SUPPORT_HUB_URL ?? 'https://genomelink-support-hub.vercel.app';

export function supportHubUrl(slug: string): string {
  return `${SUPPORT_HUB_BASE}/${slug.replace(/^\//, '')}`;
}

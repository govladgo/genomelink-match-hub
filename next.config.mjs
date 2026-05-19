/** @type {import('next').NextConfig} */

const SUPPORT_HUB_BASE =
  process.env.NEXT_PUBLIC_SUPPORT_HUB_URL ?? 'https://genomelink-support-hub.vercel.app';

const nextConfig = {
  async redirects() {
    return [
      {
        source: '/match-hub/help',
        destination: `${SUPPORT_HUB_BASE}/match-hub`,
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

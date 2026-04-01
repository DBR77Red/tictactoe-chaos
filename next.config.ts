import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: '/visualplaybook', destination: '/visualplaybook.html' },
    ]
  },
};

export default withNextIntl(nextConfig);

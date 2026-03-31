import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/superadmin/',
          '/service/*/admin/',
        ],
      },
    ],
    sitemap: 'https://gcatonkpi.vercel.app/sitemap.xml',
  };
}

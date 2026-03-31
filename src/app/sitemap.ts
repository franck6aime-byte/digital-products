import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gcatonkpi.vercel.app';

  // Récupération des services pour les inclure dans le sitemap
  const services = await prisma.service.findMany({
    select: { id: true, name: true }
  });

  const serviceUrls = services.flatMap((service) => [
    {
      url: `${baseUrl}/service/${service.id}/consult`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/service/${service.id}/admin`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3, // Moins important car protégé
    }
  ]);

  return [
    {
      url: `${baseUrl}/portal`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    ...serviceUrls,
  ];
}

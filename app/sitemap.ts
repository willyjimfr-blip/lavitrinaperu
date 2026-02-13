// app/sitemap.ts
import { MetadataRoute } from 'next';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sumawil.com';

  // Páginas estáticas
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/categorias`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/registro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    // Páginas de categorías
    const categoriesSnap = await getDocs(
      query(collection(db, 'categories'), where('active', '==', true))
    );
    const categoryPages: MetadataRoute.Sitemap = categoriesSnap.docs.map(doc => ({
      url: `${baseUrl}/categoria/${doc.data().slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.7,
    }));

    // Páginas de listings
    const listingsSnap = await getDocs(
      query(collection(db, 'listings'), where('active', '==', true))
    );
    const listingPages: MetadataRoute.Sitemap = listingsSnap.docs.map(doc => ({
      url: `${baseUrl}/listing/${doc.id}`,
      lastModified: doc.data().updatedAt?.toDate() || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));

    return [...staticPages, ...categoryPages, ...listingPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}
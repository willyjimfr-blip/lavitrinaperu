'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing, Category } from '@/types';
import ListingCard from '@/components/ListingCard';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, PackageSearch } from 'lucide-react';

export default function CategoriaPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) fetchCategoryAndListings();
  }, [slug]);

  const fetchCategoryAndListings = async () => {
    try {
      const categoriesQuery = query(
        collection(db, 'categories'),
        where('slug', '==', slug),
        where('active', '==', true)
      );
      const categoriesSnap = await getDocs(categoriesQuery);
      
      if (categoriesSnap.empty) {
        setLoading(false);
        return;
      }

      const categoryData = {
        id: categoriesSnap.docs[0].id,
        ...categoriesSnap.docs[0].data()
      } as Category;
      setCategory(categoryData);

      const listingsQuery = query(
        collection(db, 'listings'),
        where('categoryId', '==', categoryData.id),
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      );
      const listingsSnap = await getDocs(listingsQuery);
      setListings(listingsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Listing[]);

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse h-64 bg-cream-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <PackageSearch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-dark mb-4">Categoría no encontrada</h1>
        <p className="text-gray-500 mb-2 text-sm">
          Slug buscado: <code className="bg-cream-200 px-2 py-1 rounded">{slug}</code>
        </p>
        <Link 
          href="/categorias"
          className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Ver todas las categorías
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link 
        href="/categorias"
        className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Todas las categorías
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8 bg-white p-6 rounded-2xl shadow-md border border-cream-200">
        <span className="text-6xl">{category.icon}</span>
        <div>
          <h1 className="text-4xl font-display font-bold text-dark">
            {category.name}
          </h1>
          <p className="text-gray-600 mt-1">
            {listings.length} {listings.length === 1 ? 'publicación' : 'publicaciones'} disponibles
          </p>
        </div>
      </div>

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-cream-200">
          <span className="text-6xl mb-4 block">{category.icon}</span>
          <h2 className="text-2xl font-bold text-dark mb-2">
            Aún no hay publicaciones en {category.name}
          </h2>
          <p className="text-gray-600 mb-8">
            Sé el primero en publicar aquí
          </p>
          <Link
            href="/registro"
            className="inline-block bg-primary-500 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Publicar Ahora
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
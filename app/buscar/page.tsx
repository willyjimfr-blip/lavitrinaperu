// app/buscar/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/types';
import ListingCard from '@/components/ListingCard';
import SearchBar from '@/components/SearchBar';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

function BuscarContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (q) {
      searchListings(q);
    } else {
      setLoading(false);
    }
  }, [q]);

  const searchListings = async (searchQuery: string) => {
    setLoading(true);
    try {
      const listingsQuery = query(
        collection(db, 'listings'),
        where('active', '==', true)
      );
      
      const snapshot = await getDocs(listingsQuery);
      const allListings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Listing[];

      const searchTerm = searchQuery.toLowerCase();
      const filtered = allListings.filter(listing => 
        listing.title.toLowerCase().includes(searchTerm) ||
        listing.description.toLowerCase().includes(searchTerm) ||
        listing.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );

      setListings(filtered);
    } catch (error) {
      console.error('Error searching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <SearchBar />
      </div>

      {q && (
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
            Resultados de búsqueda
          </h1>
          <p className="text-gray-600 text-lg">
            Mostrando {listings.length} resultado{listings.length !== 1 ? 's' : ''} para "<span className="font-semibold">{q}</span>"
          </p>
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && !q && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¿Qué estás buscando?
          </h2>
          <p className="text-gray-600">
            Usa la barra de búsqueda para encontrar productos o servicios
          </p>
        </div>
      )}

      {!loading && q && listings.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No encontramos resultados
          </h2>
          <p className="text-gray-600 mb-4">
            Intenta con otros términos de búsqueda
          </p>
          <div className="text-sm text-gray-500">
            <p className="mb-2">Sugerencias:</p>
            <ul className="space-y-1">
              <li>• Verifica la ortografía</li>
              <li>• Usa términos más generales</li>
              <li>• Prueba con sinónimos</li>
            </ul>
          </div>
        </div>
      )}

      {!loading && listings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <SearchBar />
        </div>
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Buscando...</p>
        </div>
      </div>
    }>
      <BuscarContent />
    </Suspense>
  );
}
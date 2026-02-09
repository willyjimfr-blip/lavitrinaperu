import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing, Category } from '@/types';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';
import { ArrowLeft, Filter } from 'lucide-react';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function CategoriaPage({ params }: PageProps) {
  const { slug } = params;

  // Obtener la categoría
  const categoriesQuery = query(
    collection(db, 'categories'),
    where('slug', '==', slug),
    where('active', '==', true)
  );
  const categoriesSnapshot = await getDocs(categoriesQuery);

  if (categoriesSnapshot.empty) {
    notFound();
  }

  const categoryDoc = categoriesSnapshot.docs[0];
  const category = {
    id: categoryDoc.id,
    ...categoryDoc.data(),
  } as Category;

  // Obtener publicaciones de esta categoría
  const listingsQuery = query(
    collection(db, 'listings'),
    where('categoryId', '==', category.id),
    where('active', '==', true),
    orderBy('createdAt', 'desc')
  );
  const listingsSnapshot = await getDocs(listingsQuery);
  const listings = listingsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Listing[];

  // Separar productos y servicios
  const products = listings.filter((l) => l.type === 'product');
  const services = listings.filter((l) => l.type === 'service');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center text-primary-500 hover:text-primary-700 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-6xl">{category.icon}</span>
            <div>
              <h1 className="text-4xl font-display font-bold text-gray-900">
                {category.name}
              </h1>
              <p className="text-gray-600 mt-2">
                {listings.length} {listings.length === 1 ? 'publicación' : 'publicaciones'} disponibles
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {listings.length === 0 ? (
          /* Sin publicaciones */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">{category.icon}</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No hay publicaciones aún
            </h2>
            <p className="text-gray-600 mb-6">
              Sé el primero en publicar en esta categoría
            </p>
            <Link
              href="/registro"
              className="inline-block bg-primary-500 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Comenzar a Vender
            </Link>
          </div>
        ) : (
          <>
            {/* Productos */}
            {products.length > 0 && (
              <section className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Filter className="w-6 h-6 text-primary-500" />
                  <h2 className="text-2xl font-display font-bold text-gray-900">
                    Productos ({products.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            )}

            {/* Servicios */}
            {services.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Filter className="w-6 h-6 text-primary-500" />
                  <h2 className="text-2xl font-display font-bold text-gray-900">
                    Servicios ({services.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {services.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary-500 to-primary-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-display font-bold mb-3">
            ¿Vendes {category.name.toLowerCase()}?
          </h2>
          <p className="text-primary-100 mb-6">
            Únete a LaVitrinaPeru y muestra tus productos a miles de clientes
          </p>
          <Link
            href="/registro"
            className="inline-block bg-white text-primary-700 hover:bg-primary-50 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Vender Aquí
          </Link>
        </div>
      </div>
    </div>
  );
}

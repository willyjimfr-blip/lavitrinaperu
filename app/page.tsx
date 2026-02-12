// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing, Category } from '@/types';
import ListingCard from '@/components/ListingCard';
import SearchBar from '@/components/SearchBar';
import Link from 'next/link';
import { ShoppingBag, Sparkles, TrendingUp, Clock } from 'lucide-react';

export default function Home() {
  const [featuredListings, setFeaturedListings] = useState<Listing[]>([]);
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const featuredQuery = query(
        collection(db, 'listings'),
        where('active', '==', true),
        where('featured', '==', true),
        limit(6)
      );
      const featuredSnap = await getDocs(featuredQuery);
      setFeaturedListings(featuredSnap.docs.map(doc => ({
        id: doc.id, ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Listing[]);

      const recentQuery = query(
        collection(db, 'listings'),
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
        limit(8)
      );
      const recentSnap = await getDocs(recentQuery);
      setRecentListings(recentSnap.docs.map(doc => ({
        id: doc.id, ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Listing[]);

      const categoriesQuery = query(
        collection(db, 'categories'),
        where('active', '==', true),
        orderBy('order', 'asc')
      );
      const categoriesSnap = await getDocs(categoriesQuery);
      setCategories(categoriesSnap.docs.map(doc => ({
        id: doc.id, ...doc.data()
      })) as Category[]);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-cream-100">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white py-20 px-4 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-olive-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <p className="text-cream-200 font-medium mb-2 tracking-widest uppercase text-sm">
              🇵🇪 Marketplace Peruano
            </p>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 animate-fadeIn">
              Descubre productos y servicios
              <br />
              <span className="text-cream-200">hechos en Perú</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Conecta directamente con comerciantes locales vía WhatsApp
            </p>
          </div>

          <SearchBar />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 max-w-4xl mx-auto">
            {[
              { icon: ShoppingBag, label: 'Productos', value: '500+' },
              { icon: Sparkles, label: 'Comerciantes', value: '100+' },
              { icon: TrendingUp, label: 'Categorías', value: '20+' },
              { icon: Clock, label: 'Respuesta', value: '< 24h' },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-cream-200" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-display font-bold text-dark mb-8 text-center">
            Explora por Categoría
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categoria/${category.slug}`}
                className="group bg-white rounded-xl p-6 text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-cream-200"
              >
                <div className="text-4xl mb-3">{category.icon || '📦'}</div>
                <h3 className="font-semibold text-dark group-hover:text-primary-500 transition-colors text-sm">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Listings */}
      {featuredListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-8 h-8 text-primary-500" />
            <h2 className="text-3xl font-display font-bold text-dark">
              Destacados
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Listings */}
      {recentListings.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-8 h-8 text-primary-500" />
            <h2 className="text-3xl font-display font-bold text-dark">
              Recién Publicados
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-olive-500 text-white py-16 px-4 my-20 rounded-3xl mx-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            ¿Tienes un negocio?
          </h2>
          <p className="text-xl mb-8 text-olive-100">
            Publica tus productos o servicios gratis y conecta con miles de clientes
          </p>
          <Link
            href="/registro"
            className="inline-block bg-white text-olive-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-cream-100 transition-colors shadow-lg hover:scale-105 transform"
          >
            Comenzar a Vender
          </Link>
        </div>
      </section>
    </div>
  );
}
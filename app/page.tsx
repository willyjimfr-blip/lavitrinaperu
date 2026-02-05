'use client';

import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/types';
import ListingCard from '@/components/ListingCard';
import SearchBar from '@/components/SearchBar';

export default function HomePage() {
  const [promo, setPromo] = useState<Listing[]>([]);
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [latest, setLatest] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);

    try {
      // 🔥 PROMO DEL DÍA
      const promoQuery = query(
        collection(db, 'listings'),
        where('active', '==', true),
        where('promo', '==', true),
        limit(5)
      );

      // ⭐ DESTACADOS
      const featuredQuery = query(
        collection(db, 'listings'),
        where('active', '==', true),
        where('featured', '==', true),
        limit(8)
      );

      // 🆕 ÚLTIMOS
      const latestQuery = query(
        collection(db, 'listings'),
        where('active', '==', true),
        orderBy('createdAt', 'desc'),
        limit(8)
      );

      const [promoSnap, featuredSnap, latestSnap] = await Promise.all([
        getDocs(promoQuery),
        getDocs(featuredQuery),
        getDocs(latestQuery),
      ]);

      const mapDocs = (snap: any) =>
        snap.docs.map((doc: any) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        })) as Listing[];

      setPromo(mapDocs(promoSnap));
      setFeatured(mapDocs(featuredSnap));
      setLatest(mapDocs(latestSnap));

    } catch (err) {
      console.error('Error cargando home:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">

      {/* HERO */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl font-bold">
          Un solo lugar, varios negocios
        </h1>
        <p className="text-gray-600 text-lg">
          Encuentra productos y servicios de emprendedores locales
        </p>
        <div className="max-w-xl mx-auto">
          <SearchBar />
        </div>
      </section>

      {/* PROMO DEL DÍA */}
      {promo.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">
            🔥 Promoción del día
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {promo.map(item => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}

      {/* DESTACADOS */}
      {featured.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">
            ⭐ Destacados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featured.map(item => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}

      {/* ÚLTIMOS */}
      {latest.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">
            🆕 Recién publicados
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latest.map(item => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </div>
        </section>
      )}

      {!loading && promo.length === 0 && featured.length === 0 && (
        <p className="text-center text-gray-500">
          Aún no hay publicaciones disponibles
        </p>
      )}
    </div>
  );
}

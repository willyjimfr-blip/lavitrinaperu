// app/categorias/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Category } from '@/types';
import Link from 'next/link';
import { Grid } from 'lucide-react';

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const q = query(
        collection(db, 'categories'),
        where('active', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(cats);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse h-32 bg-cream-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-10">
        <Grid className="w-8 h-8 text-primary-500" />
        <div>
          <h1 className="text-4xl font-display font-bold text-dark">
            Todas las Categorías
          </h1>
          <p className="text-gray-600 mt-1">
            Encuentra lo que buscas en {categories.length} categorías
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categoria/${category.slug}`}
            className="group bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all hover:-translate-y-1 border border-cream-200"
          >
            <div className="text-5xl mb-4">{category.icon || '📦'}</div>
            <h3 className="font-bold text-dark group-hover:text-primary-500 transition-colors text-lg">
              {category.name}
            </h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
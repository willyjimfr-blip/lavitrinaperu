// app/categorias/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Category } from '@/types';
import Link from 'next/link';
import { Grid, ArrowRight } from 'lucide-react';

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
      
      // Debug: ver qué slugs tienen
      console.log('Categorías cargadas:', cats.map(c => ({ 
        name: c.name, 
        slug: c.slug, 
        id: c.id 
      })));
      
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
            <div key={i} className="animate-pulse h-40 bg-cream-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
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

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categoria/${category.slug}`}
            className="group bg-white rounded-2xl p-8 text-center shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-cream-200 hover:border-primary-500 cursor-pointer"
          >
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
              {category.icon || '📦'}
            </div>
            <h3 className="font-bold text-dark group-hover:text-primary-500 transition-colors text-lg mb-2">
              {category.name}
            </h3>
            <div className="flex items-center justify-center gap-1 text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
              Ver productos
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-xl">No hay categorías disponibles</p>
        </div>
      )}
    </div>
  );
}

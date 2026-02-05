'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Category } from '@/types';

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

      const snap = await getDocs(q);

      console.log('Firestore categories:', snap.size);

      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];

      setCategories(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        Cargando categorías...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8">Categorías</h1>

      {categories.length === 0 && (
        <p className="text-gray-500">No hay categorías activas</p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="border rounded-xl p-6 text-center hover:shadow-lg transition"
          >
            <div className="text-4xl mb-3">{cat.icon}</div>
            <h3 className="font-semibold text-lg">{cat.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

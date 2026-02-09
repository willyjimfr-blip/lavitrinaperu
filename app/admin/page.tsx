'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminRoute from '@/components/AdminRoute';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Package, 
  Tags, 
  Users, 
  TrendingUp,
  Clock,
  Star,
  Eye
} from 'lucide-react';

interface Stats {
  totalListings: number;
  activeListings: number;
  featuredListings: number;
  totalCategories: number;
  recentListings: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalListings: 0,
    activeListings: 0,
    featuredListings: 0,
    totalCategories: 0,
    recentListings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Total de publicaciones
      const listingsSnapshot = await getDocs(collection(db, 'listings'));
      const allListings = listingsSnapshot.docs;

      // Publicaciones activas
      const activeListings = allListings.filter(
        (doc) => doc.data().active === true
      );

      // Publicaciones destacadas
      const featuredListings = allListings.filter(
        (doc) => doc.data().featured === true
      );

      // Publicaciones recientes (últimos 7 días)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentListings = allListings.filter((doc) => {
        const createdAt = doc.data().createdAt?.toDate();
        return createdAt && createdAt >= sevenDaysAgo;
      });

      // Total de categorías
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));

      setStats({
        totalListings: allListings.length,
        activeListings: activeListings.length,
        featuredListings: featuredListings.length,
        totalCategories: categoriesSnapshot.size,
        recentListings: recentListings.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  Panel de Administración
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona tu marketplace desde aquí
                </p>
              </div>
              <Link
                href="/"
                className="text-primary-500 hover:text-primary-700 font-medium"
              >
                ← Volver al sitio
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Publicaciones */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Publicaciones
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {loading ? '...' : stats.totalListings}
                  </p>
                </div>
                <div className="bg-primary-100 p-3 rounded-lg">
                  <Package className="w-8 h-8 text-primary-500" />
                </div>
              </div>
            </div>

            {/* Publicaciones Activas */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Activas</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">
                    {loading ? '...' : stats.activeListings}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <Eye className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>

            {/* Destacadas */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Destacadas
                  </p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">
                    {loading ? '...' : stats.featuredListings}
                  </p>
                </div>
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Star className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Categorías
                  </p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {loading ? '...' : stats.totalCategories}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Tags className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Actividad Reciente
              </h2>
            </div>
            <p className="text-gray-600">
              <span className="font-bold text-primary-500">
                {stats.recentListings}
              </span>{' '}
              nuevas publicaciones en los últimos 7 días
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Gestionar Categorías */}
            <Link
              href="/admin/categorias"
              className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100 hover:border-primary-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-primary-100 p-3 rounded-lg group-hover:bg-primary-500 transition-colors">
                  <Tags className="w-8 h-8 text-primary-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Gestionar Categorías
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Agregar, editar y ordenar categorías
                  </p>
                </div>
              </div>
            </Link>

            {/* Gestionar Publicaciones */}
            <Link
              href="/admin/publicaciones"
              className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-100 hover:border-primary-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-500 transition-colors">
                  <Package className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">
                    Gestionar Publicaciones
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Aprobar, destacar y moderar
                  </p>
                </div>
              </div>
            </Link>

            {/* Ver Estadísticas */}
            <div className="bg-gray-100 rounded-xl shadow-sm p-6 border-2 border-gray-200 opacity-50">
              <div className="flex items-center gap-4">
                <div className="bg-gray-200 p-3 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-500 text-lg">
                    Estadísticas Avanzadas
                  </h3>
                  <p className="text-gray-400 text-sm">Próximamente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
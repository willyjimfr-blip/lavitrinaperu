// app/admin/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminRoute from '@/components/AdminRoute';
import Link from 'next/link';
import { 
  Users, 
  Package, 
  Tag, 
  TrendingUp,
  Eye,
  Star,
  ShoppingBag
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMerchants: 0,
    totalListings: 0,
    activeListings: 0,
    featuredListings: 0,
    totalCategories: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Total usuarios
      const usersSnap = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnap.size;
      const totalMerchants = usersSnap.docs.filter(
        doc => doc.data().role === 'merchant' || doc.data().role === 'pending'
      ).length;

      // Total publicaciones
      const listingsSnap = await getDocs(collection(db, 'listings'));
      const totalListings = listingsSnap.size;
      const activeListings = listingsSnap.docs.filter(
        doc => doc.data().active === true
      ).length;
      const featuredListings = listingsSnap.docs.filter(
        doc => doc.data().featured === true
      ).length;

      // Total categorías
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      const totalCategories = categoriesSnap.size;

      setStats({
        totalUsers,
        totalMerchants,
        totalListings,
        activeListings,
        featuredListings,
        totalCategories,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
    },
    {
      title: 'Comerciantes',
      value: stats.totalMerchants,
      icon: ShoppingBag,
      color: 'bg-green-500',
      textColor: 'text-green-500',
    },
    {
      title: 'Publicaciones',
      value: stats.totalListings,
      icon: Package,
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
    },
    {
      title: 'Activas',
      value: stats.activeListings,
      icon: Eye,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
    },
    {
      title: 'Destacadas',
      value: stats.featuredListings,
      icon: Star,
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
    },
    {
      title: 'Categorías',
      value: stats.totalCategories,
      icon: Tag,
      color: 'bg-pink-500',
      textColor: 'text-pink-500',
    },
  ];

  if (loading) {
    return (
      <AdminRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Cargando estadísticas...</div>
        </div>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-dark mb-2">
            Panel de Administración
          </h1>
          <p className="text-gray-600">
            Gestiona todo el marketplace desde aquí
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-dark">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`w-8 h-8 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/categorias"
              className="bg-primary-500 hover:bg-primary-700 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all text-center"
            >
              <Tag className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Gestionar Categorías</h3>
              <p className="text-primary-100">Crear, editar y eliminar categorías</p>
            </Link>

            <Link
              href="/admin/publicaciones"
              className="bg-purple-500 hover:bg-purple-700 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all text-center"
            >
              <Package className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Ver Publicaciones</h3>
              <p className="text-purple-100">Gestionar todas las publicaciones</p>
            </Link>

            <Link
              href="/admin/comerciantes"
              className="bg-green-500 hover:bg-green-700 text-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all text-center"
            >
              <Users className="w-12 h-12 mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-2">Ver Comerciantes</h3>
              <p className="text-green-100">Administrar usuarios comerciantes</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-2xl font-bold text-dark mb-4">
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-cream-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <div>
                <p className="font-medium text-dark">
                  Sistema funcionando correctamente
                </p>
                <p className="text-sm text-gray-600">
                  {stats.activeListings} publicaciones activas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/types';
import { Eye, Trash2, Edit, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading: authLoading, isPending } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && (user.role === 'pending' || !user.active)) {
      router.push('/pendiente');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.active) {
      fetchListings();
    }
  }, [user]);

  const fetchListings = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, 'listings'),
        where('merchantId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Listing[];
      
      // Ordenar por fecha de creación descendente
      data.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'listings', id), {
        active: !currentStatus,
        updatedAt: new Date(),
      });
      fetchListings();
    } catch (error) {
      console.error('Error toggling active:', error);
      alert('Error al cambiar el estado');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;
    
    try {
      await deleteDoc(doc(db, 'listings', id));
      fetchListings();
      alert('Publicación eliminada');
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Error al eliminar');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user || isPending) {
    return null;
  }

  const stats = {
    total: listings.length,
    active: listings.filter(l => l.active).length,
    inactive: listings.filter(l => !l.active).length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-dark mb-2">
          Mi Dashboard
        </h1>
        <p className="text-gray-600">
          Bienvenido, {user.displayName || user.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md border border-cream-200">
          <div className="text-sm text-gray-500 mb-1">Total Publicaciones</div>
          <div className="text-3xl font-bold text-dark">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-cream-200">
          <div className="text-sm text-gray-500 mb-1">Activas</div>
          <div className="text-3xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-md border border-cream-200">
          <div className="text-sm text-gray-500 mb-1">Inactivas</div>
          <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-dark">Mis Publicaciones</h2>
        <Link
          href="/dashboard/nueva-publicacion"
          className="bg-primary-500 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Publicación
        </Link>
      </div>

      {/* Listings Table */}
      {listings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-dark mb-2">
            Aún no tienes publicaciones
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primera publicación y empieza a vender
          </p>
          <Link
            href="/dashboard/nueva-publicacion"
            className="inline-block bg-primary-500 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Crear Primera Publicación
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-100 border-b border-cream-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Publicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-cream-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 bg-cream-200 rounded-lg overflow-hidden">
                          {listing.images && listing.images.length > 0 ? (
                            <Image
                              src={listing.images[0]}
                              alt={listing.title}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">
                              📦
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-dark text-sm line-clamp-2">
                            {listing.title}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                            {listing.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        listing.type === 'product'
                          ? 'bg-primary-100 text-primary-700'
                          : 'bg-olive-100 text-olive-700'
                      }`}>
                        {listing.type === 'product' ? 'Producto' : 'Servicio'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-dark">
                      {listing.price}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(listing.id, listing.active)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          listing.active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {listing.active ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/editar/${listing.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/listing/${listing.id}`}
                          target="_blank"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-cream-200 hover:bg-cream-300 text-gray-700 transition-colors"
                          title="Ver publicación"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
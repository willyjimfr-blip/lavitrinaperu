// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing } from '@/types';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye, EyeOff, Package, Briefcase } from 'lucide-react';
import Image from 'next/image';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user) {
      fetchListings();
    }
  }, [user, authLoading, router]);

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
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (listingId: string, currentActive: boolean) => {
    try {
      await updateDoc(doc(db, 'listings', listingId), {
        active: !currentActive,
        updatedAt: new Date(),
      });
      fetchListings();
    } catch (error) {
      console.error('Error toggling active:', error);
      alert('Error al actualizar el estado');
    }
  };

  const handleDelete = async (listingId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;
    
    try {
      await deleteDoc(doc(db, 'listings', listingId));
      fetchListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
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

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Mi Dashboard
        </h1>
        <p className="text-gray-600">
          Bienvenido, {user.displayName || user.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Publicaciones</p>
              <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
            </div>
            <Package className="w-12 h-12 text-primary-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Activas</p>
              <p className="text-3xl font-bold text-green-600">
                {listings.filter(l => l.active).length}
              </p>
            </div>
            <Eye className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Inactivas</p>
              <p className="text-3xl font-bold text-gray-400">
                {listings.filter(l => !l.active).length}
              </p>
            </div>
            <EyeOff className="w-12 h-12 text-gray-400 opacity-20" />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Mis Publicaciones</h2>
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
        <div className="bg-white rounded-xl p-12 text-center shadow-md">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Aún no tienes publicaciones
          </h3>
          <p className="text-gray-600 mb-6">
            Crea tu primera publicación para empezar a vender
          </p>
          <Link
            href="/dashboard/nueva-publicacion"
            className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Crear Publicación
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Publicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                          {listing.images[0] && (
                            <Image
                              src={listing.images[0]}
                              alt={listing.title}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {listing.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {listing.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        listing.type === 'product'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {listing.type === 'product' ? (
                          <>
                            <Package className="w-3 h-3" />
                            Producto
                          </>
                        ) : (
                          <>
                            <Briefcase className="w-3 h-3" />
                            Servicio
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {listing.price}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(listing.id, listing.active)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          listing.active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        } transition-colors`}
                      >
                        {listing.active ? (
                          <>
                            <Eye className="w-3 h-3" />
                            Activa
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            Inactiva
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link
                        href={`/listing/${listing.id}`}
                        target="_blank"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
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
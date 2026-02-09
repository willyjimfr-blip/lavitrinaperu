'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminRoute from '@/components/AdminRoute';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Star, 
  Eye, 
  EyeOff, 
  Edit2, 
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import Image from 'next/image';

interface Listing {
  id: string;
  title: string;
  type: 'product' | 'service';
  description: string;
  price: string;
  images: string[];
  categoryId: string;
  merchantId: string;
  featured: boolean;
  active: boolean;
  createdAt: any;
}

interface User {
  id: string;
  displayName: string;
  email: string;
}

export default function PublicacionesAdmin() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Cargar publicaciones
      const listingsQuery = query(
        collection(db, 'listings'),
        orderBy('createdAt', 'desc')
      );
      const listingsSnapshot = await getDocs(listingsQuery);
      const listingsData = listingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Listing[];
      setListings(listingsData);

      // Cargar usuarios
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        displayName: doc.data().displayName || 'Sin nombre',
        email: doc.data().email,
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'listings', id), {
        featured: !currentStatus,
      });
      loadData();
      alert(
        !currentStatus
          ? '⭐ Publicación marcada como destacada'
          : '✅ Publicación desmarcada'
      );
    } catch (error) {
      console.error('Error toggling featured:', error);
      alert('❌ Error al actualizar');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'listings', id), {
        active: !currentStatus,
      });
      loadData();
      alert(
        !currentStatus
          ? '✅ Publicación activada'
          : '🔒 Publicación desactivada'
      );
    } catch (error) {
      console.error('Error toggling active:', error);
      alert('❌ Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta publicación?')) return;

    try {
      await deleteDoc(doc(db, 'listings', id));
      loadData();
      alert('✅ Publicación eliminada');
    } catch (error) {
      console.error('Error deleting listing:', error);
      alert('❌ Error al eliminar');
    }
  };

  // Filtrar publicaciones
  const filteredListings = listings.filter((listing) => {
    // Filtro por usuario
    if (filterUser !== 'all' && listing.merchantId !== filterUser) {
      return false;
    }

    // Filtro por estado
    if (filterStatus === 'active' && !listing.active) return false;
    if (filterStatus === 'inactive' && listing.active) return false;
    if (filterStatus === 'featured' && !listing.featured) return false;

    // Filtro por búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        listing.title.toLowerCase().includes(search) ||
        listing.description.toLowerCase().includes(search)
      );
    }

    return true;
  });

  const getUserName = (merchantId: string) => {
    const user = users.find((u) => u.id === merchantId);
    return user ? user.displayName : 'Usuario desconocido';
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/admin"
                  className="text-primary-500 hover:text-primary-700 font-medium mb-2 inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al dashboard
                </Link>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  Gestión de Publicaciones
                </h1>
                <p className="text-gray-600 mt-1">
                  {filteredListings.length} publicaciones
                </p>
              </div>
              <Link
                href="/admin/publicaciones/nueva"
                className="bg-primary-500 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nueva Publicación
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por título o descripción..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtro por usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Por Usuario
                </label>
                <select
                  value={filterUser}
                  onChange={(e) => setFilterUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todos los usuarios</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.displayName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-1" />
                  Por Estado
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">Todas</option>
                  <option value="active">Activas</option>
                  <option value="inactive">Inactivas</option>
                  <option value="featured">Destacadas</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Publicaciones */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando publicaciones...</p>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <p className="text-gray-600 text-lg">
                No hay publicaciones que coincidan con los filtros
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Imagen */}
                    <div className="md:w-48 h-48 bg-gray-100 relative">
                      {listing.images && listing.images.length > 0 ? (
                        <Image
                          src={listing.images[0]}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                          📦
                        </div>
                      )}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">
                            {listing.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Por: <span className="font-medium">{getUserName(listing.merchantId)}</span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {listing.featured && (
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold">
                              ⭐ Destacado
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              listing.active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {listing.active ? '👁️ Visible' : '🔒 Oculto'}
                          </span>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-3 line-clamp-2">
                        {listing.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-primary-500">
                            {listing.price}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {listing.type === 'product' ? '📦 Producto' : '💼 Servicio'}
                          </p>
                        </div>

                        {/* Acciones */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => toggleFeatured(listing.id, listing.featured)}
                            className={`p-2 rounded-lg transition-colors ${
                              listing.featured
                                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={listing.featured ? 'Quitar destacado' : 'Destacar'}
                          >
                            <Star
                              className={`w-5 h-5 ${
                                listing.featured ? 'fill-yellow-500' : ''
                              }`}
                            />
                          </button>

                          <button
                            onClick={() => toggleActive(listing.id, listing.active)}
                            className={`p-2 rounded-lg transition-colors ${
                              listing.active
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                            title={listing.active ? 'Desactivar' : 'Activar'}
                          >
                            {listing.active ? (
                              <Eye className="w-5 h-5" />
                            ) : (
                              <EyeOff className="w-5 h-5" />
                            )}
                          </button>

                          <Link
                            href={`/listing/${listing.id}`}
                            target="_blank"
                            className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                            title="Ver publicación"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>

                          <button
                            onClick={() => handleDelete(listing.id)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminRoute>
  );
}

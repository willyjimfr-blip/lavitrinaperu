// app/admin/comerciantes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';
import AdminRoute from '@/components/AdminRoute';
import { UserCheck, UserX, Mail, Phone, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function AdminComerciantesPage() {
  const [merchants, setMerchants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'inactive'>('pending');

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
      // Filtrar solo merchants y pending (no admins)
      setMerchants(users.filter(u => u.role === 'merchant' || u.role === 'pending'));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (uid: string) => {
    if (!confirm('¿Aprobar este comerciante?')) return;
    
    try {
      await updateDoc(doc(db, 'users', uid), { 
        role: 'merchant',
        active: true 
      });
      fetchMerchants();
      alert('Comerciante aprobado exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al aprobar comerciante');
    }
  };

  const handleReject = async (uid: string) => {
    if (!confirm('¿Rechazar/Desactivar este comerciante?')) return;
    
    try {
      await updateDoc(doc(db, 'users', uid), { 
        active: false 
      });
      fetchMerchants();
      alert('Comerciante desactivado');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al desactivar comerciante');
    }
  };

  const handleToggleActive = async (uid: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { active: !current });
      fetchMerchants();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Filtrar comerciantes
  const filteredMerchants = merchants.filter(m => {
    if (filter === 'pending') return m.role === 'pending';
    if (filter === 'active') return m.role === 'merchant' && m.active;
    if (filter === 'inactive') return m.role === 'merchant' && !m.active;
    return true;
  });

  const stats = {
    pending: merchants.filter(m => m.role === 'pending').length,
    active: merchants.filter(m => m.role === 'merchant' && m.active).length,
    inactive: merchants.filter(m => m.role === 'merchant' && !m.active).length,
    total: merchants.length,
  };

  if (loading) {
    return (
      <AdminRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Cargando...</div>
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
            Gestión de Comerciantes
          </h1>
          <p className="text-gray-600">
            {merchants.length} comerciantes registrados
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-cream-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Pendientes</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-cream-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Activos</div>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-cream-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Inactivos</div>
            <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-cream-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Total</div>
            <div className="text-3xl font-bold text-dark">{stats.total}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {[
            { key: 'pending', label: `Pendientes (${stats.pending})`, color: 'yellow' },
            { key: 'active', label: `Activos (${stats.active})`, color: 'green' },
            { key: 'inactive', label: `Inactivos (${stats.inactive})`, color: 'red' },
            { key: 'all', label: `Todos (${stats.total})`, color: 'gray' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f.key
                  ? f.color === 'yellow' ? 'bg-yellow-500 text-white'
                  : f.color === 'green' ? 'bg-green-500 text-white'
                  : f.color === 'red' ? 'bg-red-500 text-white'
                  : 'bg-dark text-white'
                  : 'bg-white text-dark hover:bg-cream-200 border border-cream-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid de comerciantes */}
        {filteredMerchants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-dark mb-2">
              No hay comerciantes en esta categoría
            </h2>
            <p className="text-gray-600">
              {filter === 'pending' && 'No hay solicitudes pendientes'}
              {filter === 'active' && 'No hay comerciantes activos'}
              {filter === 'inactive' && 'No hay comerciantes inactivos'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMerchants.map((merchant) => (
              <div
                key={merchant.uid}
                className={`bg-white rounded-xl p-6 shadow-md border-2 transition-all hover:shadow-lg ${
                  merchant.role === 'pending'
                    ? 'border-yellow-200 bg-yellow-50'
                    : merchant.active 
                      ? 'border-green-200' 
                      : 'border-red-200 bg-red-50'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                      merchant.role === 'pending' 
                        ? 'bg-yellow-500'
                        : merchant.active 
                          ? 'bg-green-500' 
                          : 'bg-red-500'
                    }`}>
                      {(merchant.displayName || merchant.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-dark text-sm">
                        {merchant.displayName || 'Sin nombre'}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        merchant.role === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : merchant.active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {merchant.role === 'pending' ? '⏳ Pendiente' : merchant.active ? '✓ Activo' : '✗ Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                    <span className="truncate">{merchant.email}</span>
                  </div>
                  {merchant.whatsapp && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-olive-500 flex-shrink-0" />
                      <span>{merchant.whatsapp}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    Registrado: {merchant.createdAt instanceof Date 
                      ? merchant.createdAt.toLocaleDateString('es-PE')
                      : 'N/A'}
                  </div>
                </div>

                {/* Acciones */}
                <div className="space-y-2 pt-4 border-t border-cream-200">
                  {merchant.role === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(merchant.uid)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors text-sm bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Aprobar Comerciante
                      </button>
                      <button
                        onClick={() => handleReject(merchant.uid)}
                        className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors text-sm bg-red-100 hover:bg-red-200 text-red-700"
                      >
                        <XCircle className="w-4 h-4" />
                        Rechazar
                      </button>
                    </>
                  )}

                  {merchant.role === 'merchant' && (
                    <button
                      onClick={() => handleToggleActive(merchant.uid, merchant.active)}
                      className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                        merchant.active
                          ? 'bg-red-100 hover:bg-red-200 text-red-700'
                          : 'bg-green-100 hover:bg-green-200 text-green-700'
                      }`}
                    >
                      {merchant.active 
                        ? <><UserX className="w-4 h-4" /> Desactivar</> 
                        : <><UserCheck className="w-4 h-4" /> Activar</>
                      }
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminRoute>
  );
}
// app/admin/comerciantes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';
import AdminRoute from '@/components/AdminRoute';
import { UserCheck, UserX, Mail, Phone } from 'lucide-react';

export default function AdminComerciantesPage() {
  const [merchants, setMerchants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
      setMerchants(users.filter(u => u.role === 'merchant'));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (uid: string, current: boolean) => {
    await updateDoc(doc(db, 'users', uid), { active: !current });
    fetchMerchants();
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
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-dark mb-2">
            Gestión de Comerciantes
          </h1>
          <p className="text-gray-600">
            {merchants.length} comerciantes registrados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchants.map((merchant) => (
            <div
              key={merchant.uid}
              className={`bg-white rounded-xl p-6 shadow-md border-2 transition-colors ${
                merchant.active 
                  ? 'border-cream-200' 
                  : 'border-red-200 bg-red-50'
              }`}
            >
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-500 font-bold text-xl">
                  {(merchant.displayName || merchant.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-dark">
                    {merchant.displayName || 'Sin nombre'}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    merchant.active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {merchant.active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-primary-500" />
                  <span className="truncate">{merchant.email}</span>
                </div>
                {merchant.whatsapp && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-olive-500" />
                    <span>{merchant.whatsapp}</span>
                  </div>
                )}
                <div className="text-xs text-gray-400">
                  Registrado: {merchant.createdAt instanceof Date 
                    ? merchant.createdAt.toLocaleDateString('es-PE')
                    : 'N/A'}
                </div>
              </div>

              {/* Action */}
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
            </div>
          ))}
        </div>

        {merchants.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-dark mb-2">
              No hay comerciantes registrados
            </h2>
            <p className="text-gray-600">
              Cuando alguien se registre aparecerá aquí
            </p>
          </div>
        )}
      </div>
    </AdminRoute>
  );
}
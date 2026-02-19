// app/pendiente/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Clock, CheckCircle, Mail } from 'lucide-react';

export default function PendientePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && user.role === 'merchant' && user.active) {
      router.push('/dashboard');
    }
    if (!loading && user && user.role === 'admin') {
      router.push('/admin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
          <Clock className="w-10 h-10 text-yellow-600" />
        </div>

        <h1 className="text-3xl font-display font-bold text-dark mb-4">
          Cuenta en Revisión
        </h1>

        <p className="text-gray-600 mb-6 text-lg">
          ¡Gracias por registrarte en Sumawil! Tu cuenta está siendo revisada por nuestro equipo.
        </p>

        <div className="bg-cream-100 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-left text-gray-700">
              Recibirás un correo cuando tu cuenta sea aprobada
            </p>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-left text-gray-700">
              El proceso de aprobación toma menos de 24 horas
            </p>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Email registrado: <strong>{user?.email}</strong>
        </div>

        <div className="mt-8 pt-6 border-t border-cream-200">
          <p className="text-sm text-gray-500 mb-3">¿Necesitas ayuda?</p>
          
            href="mailto:contacto@sumawil.com"
            className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-700 font-medium"
          <a>
            <Mail className="w-4 h-4" />
            contacto@sumawil.com
          </a>
        </div>

        <button
          onClick={() => router.push('/')}
          className="mt-6 w-full bg-cream-200 hover:bg-cream-300 text-dark font-medium py-3 px-6 rounded-lg transition-colors"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
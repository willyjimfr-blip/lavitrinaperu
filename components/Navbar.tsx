// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-cream-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <ShoppingBag className="w-8 h-8 text-primary-500 group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-display font-bold text-dark">
              Suma<span className="text-primary-500">wil</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-dark hover:text-primary-500 font-medium transition-colors">
              Inicio
            </Link>
            <Link href="/categorias" className="text-dark hover:text-primary-500 font-medium transition-colors">
              Categorías
            </Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="text-olive-500 hover:text-olive-700 font-medium transition-colors">
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="text-dark hover:text-primary-500 font-medium transition-colors">
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-dark hover:text-primary-500 font-medium transition-colors"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-dark hover:text-primary-500 font-medium transition-colors">
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Vender Aquí
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-dark hover:bg-cream-200"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-3 border-t border-cream-200">
            <Link href="/" className="block text-dark hover:text-primary-500 font-medium py-2" onClick={() => setIsOpen(false)}>
              Inicio
            </Link>
            <Link href="/categorias" className="block text-dark hover:text-primary-500 font-medium py-2" onClick={() => setIsOpen(false)}>
              Categorías
            </Link>

            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="block text-olive-500 hover:text-olive-700 font-medium py-2" onClick={() => setIsOpen(false)}>
                    Admin
                  </Link>
                )}
                <Link href="/dashboard" className="block text-dark hover:text-primary-500 font-medium py-2" onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <button
                  onClick={() => { signOut(); setIsOpen(false); }}
                  className="block w-full text-left text-dark hover:text-primary-500 font-medium py-2"
                >
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block text-dark hover:text-primary-500 font-medium py-2" onClick={() => setIsOpen(false)}>
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  className="block bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Vender Aquí
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

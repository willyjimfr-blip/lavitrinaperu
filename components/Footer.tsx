// components/Footer.tsx
import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin, ShoppingBag } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark text-cream-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag className="w-8 h-8 text-primary-500" />
              <h3 className="text-2xl font-display font-bold text-cream-100">
                Suma<span className="text-primary-500">wil</span>
              </h3>
            </div>
            <p className="text-cream-300 mb-4">
              El marketplace que conecta comerciantes peruanos con sus clientes.
              Publica tus productos y servicios gratis.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-cream-300 hover:text-primary-500 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-cream-300 hover:text-primary-500 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="mailto:contacto@sumawil.com" className="text-cream-300 hover:text-primary-500 transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-cream-100 mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-cream-300 hover:text-primary-500 transition-colors">Inicio</Link></li>
              <li><Link href="/categorias" className="text-cream-300 hover:text-primary-500 transition-colors">Categorías</Link></li>
              <li><Link href="/registro" className="text-cream-300 hover:text-primary-500 transition-colors">Vender Aquí</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-cream-100 mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-cream-300">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary-500" />
                Lima, Perú
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0 text-primary-500" />
                <a href="mailto:contacto@sumawil.com" className="text-cream-300 hover:text-primary-500 transition-colors">
                  contacto@sumawil.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-cream-300">
          <p>&copy; {new Date().getFullYear()} Sumawil. Todos los derechos reservados. 🇵🇪</p>
        </div>
      </div>
    </footer>
  );
}
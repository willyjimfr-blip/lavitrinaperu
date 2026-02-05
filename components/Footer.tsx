// components/Footer.tsx
import Link from 'next/link';
import { Facebook, Instagram, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-primary-700 text-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-display font-bold text-white mb-4">
              LaVitrina<span className="text-primary-100">Peru</span>
            </h3>
            <p className="text-gray-300 mb-4">
              El marketplace que conecta comerciantes peruanos con sus clientes. 
              Publica tus productos y servicios gratis.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-primary-100 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-primary-100 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="mailto:contacto@lavitrinaperu.com" className="hover:text-primary-100 transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-primary-100 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="hover:text-primary-100 transition-colors">
                  Categorías
                </Link>
              </li>
              <li>
                <Link href="/registro" className="hover:text-primary-100 transition-colors">
                  Vender Aquí
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>Lima, Perú</span>
              </li>
              <li className="flex items-start space-x-2">
                <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <a href="mailto:contacto@lavitrinaperu.com" className="hover:text-primary-100 transition-colors">
                  contacto@lavitrinaperu.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-600 mt-8 pt-8 text-center text-sm text-gray-300">
          <p>&copy; {new Date().getFullYear()} LaVitrinaPeru. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
// components/ListingCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Listing } from '@/types';
import { Tag } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  // Validar que listing tenga datos
  if (!listing) return null;

  return (
    <Link href={`/listing/${listing.id}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-gray-100">
        {/* Imagen */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {listing.images?.length > 0 ? (
            <Image
              src={listing.images[0]}
              alt={listing.title || 'Producto'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-4xl">📦</span>
            </div>
          )}

          {/* Badge de tipo */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                listing.type === 'product'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-purple-100 text-purple-700'
              }`}
            >
              {listing.type === 'product' ? 'Producto' : 'Servicio'}
            </span>
          </div>

          {/* Badge de destacado */}
          {listing.featured && (
            <div className="absolute top-3 right-3">
              <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                ⭐ Destacado
              </span>
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="p-4">
          {/* Título */}
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors">
            {listing.title || 'Sin título'}
          </h3>

          {/* Descripción */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {listing.description || 'Sin descripción'}
          </p>

          {/* Tags */}
          {listing.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {listing.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded-md"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
              {listing.tags.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{listing.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Precio y Acción */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-primary-500">
                {listing.price || 'Consultar'}
              </p>
            </div>
            <div className="bg-primary-500 group-hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Ver Más
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

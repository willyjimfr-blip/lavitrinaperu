// components/ListingCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Listing } from '@/types';
import { Tag } from 'lucide-react';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const mainImage = listing.images[0] || '/placeholder.png';
  
  return (
    <Link 
      href={`/listing/${listing.id}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <Image
          src={mainImage}
          alt={listing.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Badge tipo */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            listing.type === 'product' 
              ? 'bg-blue-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            {listing.type === 'product' ? 'Producto' : 'Servicio'}
          </span>
        </div>

        {/* Featured badge */}
        {listing.featured && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white">
              ⭐ Destacado
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary-500 transition-colors line-clamp-2 mb-2">
          {listing.title}
        </h3>
        
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
          {listing.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-500">
            {listing.price}
          </span>
          
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            {listing.tags.length > 0 ? listing.tags[0] : 'Ver más'}
          </span>
        </div>
      </div>
    </Link>
  );
}

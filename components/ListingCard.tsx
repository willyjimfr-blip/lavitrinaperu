// components/ListingCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Listing } from '@/types';
import { Tag } from 'lucide-react';
import { getOptimizedUrl } from '@/lib/cloudinary';

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  const mainImage = listing.images && listing.images.length > 0
    ? getOptimizedUrl(listing.images[0], 'card')
    : null;
  
  return (
    <Link 
      href={`/listing/${listing.id}`}
      className="group block bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-cream-200"
    >
      {/* Imagen con aspect ratio fijo */}
      <div className="relative w-full aspect-square bg-cream-200 overflow-hidden">
        {mainImage ? (
          <Image
            src={mainImage}
            alt={listing.title}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300 p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-cream-200">
            <span className="text-4xl">📦</span>
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
            listing.type === 'product'
              ? 'bg-primary-500 text-white'
              : 'bg-olive-500 text-white'
          }`}>
            {listing.type === 'product' ? 'Producto' : 'Servicio'}
          </span>
        </div>

        {listing.featured && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow-md">
              ⭐ Destacado
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-dark group-hover:text-primary-500 transition-colors line-clamp-2 mb-2 min-h-[3.5rem]">
          {listing.title}
        </h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
          {listing.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary-500">
            {listing.price}
          </span>
          {listing.tags && listing.tags.length > 0 && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              {listing.tags[0]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
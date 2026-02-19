
// app/listing/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing, Category } from '@/types';
import Image from 'next/image';
import { MessageCircle, Tag, Clock, Share2, ArrowLeft } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ListingDetail() {
  const params = useParams();
  const id = params.id as string;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const listingDoc = await getDoc(doc(db, 'listings', id));
      if (listingDoc.exists()) {
        const data = {
          id: listingDoc.id,
          ...listingDoc.data(),
          tags: listingDoc.data().tags || [],
          images: listingDoc.data().images || [],
          createdAt: listingDoc.data().createdAt?.toDate(),
          updatedAt: listingDoc.data().updatedAt?.toDate(),
        } as Listing;
        setListing(data);

        if (data.categoryId) {
          const categoryDoc = await getDoc(doc(db, 'categories', data.categoryId));
          if (categoryDoc.exists()) {
            setCategory({ id: categoryDoc.id, ...categoryDoc.data() } as Category);
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!listing) return;
    const message = `Hola! Me interesa tu ${listing.type === 'product' ? 'producto' : 'servicio'}: *${listing.title}*. Lo vi en Sumawil.`;
    const url = `https://wa.me/${listing.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title,
          text: listing?.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado al portapapeles');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="animate-pulse">
            <div className="aspect-square bg-cream-200 rounded-xl mb-4"></div>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-square bg-cream-200 rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-cream-200 rounded w-3/4"></div>
            <div className="h-12 bg-cream-200 rounded w-1/3"></div>
            <div className="h-32 bg-cream-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-dark mb-4">
          Publicación no encontrada
        </h1>
        <Link href="/" className="text-primary-500 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al inicio
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div>
          {/* Imagen principal */}
          <div className="relative w-full aspect-square bg-cream-200 rounded-xl overflow-hidden mb-4 border border-cream-300">
            {listing.images && listing.images.length > 0 ? (
              <Image
                src={listing.images[selectedImage]}
                alt={listing.title}
                fill
                className="object-contain p-4"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">📦</span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {listing.images && listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-cream-200 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index 
                      ? 'border-primary-500' 
                      : 'border-cream-300 hover:border-primary-300'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${listing.title} ${index + 1}`}
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detalles */}
        <div>
          {/* Badges */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {category && (
              <Link
                href={`/categoria/${category.slug}`}
                className="px-3 py-1 bg-cream-200 hover:bg-cream-300 text-dark rounded-full text-sm font-medium transition-colors"
              >
                {category.icon} {category.name}
              </Link>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              listing.type === 'product'
                ? 'bg-primary-100 text-primary-700'
                : 'bg-olive-100 text-olive-700'
            }`}>
              {listing.type === 'product' ? '📦 Producto' : '💼 Servicio'}
            </span>
            {listing.featured && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                ⭐ Destacado
              </span>
            )}
          </div>

          {/* Título */}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-dark mb-4">
            {listing.title}
          </h1>

          {/* Precio */}
          <div className="text-4xl md:text-5xl font-bold text-primary-500 mb-6">
            {listing.price}
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <h3 className="font-bold text-dark mb-2 text-lg">Descripción</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {listing.description}
            </p>
          </div>

          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {listing.tags.map((tag, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 px-3 py-1 bg-cream-200 text-dark rounded-full text-sm"
                >
                  <Tag className="w-3 h-3 text-primary-500" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Fecha */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 pb-8 border-b border-cream-200">
            <Clock className="w-4 h-4" />
            Publicado el {listing.createdAt instanceof Date
              ? listing.createdAt.toLocaleDateString('es-PE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              : 'Fecha no disponible'}
          </div>

          {/* Botones de acción */}
          <div className="space-y-3 sticky top-4">
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-whatsapp hover:bg-whatsapp-hover text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-lg hover:shadow-xl text-lg"
            >
              <MessageCircle className="w-6 h-6" />
              Contactar por WhatsApp
            </button>

            <button
              onClick={handleShare}
              className="w-full bg-cream-200 hover:bg-cream-300 text-dark font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Compartir publicación
            </button>
          </div>

          {/* Tip */}
          <div className="mt-6 p-4 bg-olive-50 rounded-xl border border-olive-200">
            <p className="text-sm text-olive-700">
              <strong>💡 Tip:</strong> Al contactar por WhatsApp, el vendedor recibirá un mensaje automático con el nombre del producto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

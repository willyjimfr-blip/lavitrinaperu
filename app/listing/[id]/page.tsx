// app/listing/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing, Category } from '@/types';
import Image from 'next/image';
import { MessageCircle, Tag, Clock, Share2 } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function ListingDetail() {
  const params = useParams();
  const id = params.id as string;
  
  const [listing, setListing] = useState<Listing | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const listingDoc = await getDoc(doc(db, 'listings', id));
      if (listingDoc.exists()) {
        const listingData = {
          id: listingDoc.id,
          ...listingDoc.data(),
          createdAt: listingDoc.data().createdAt?.toDate(),
          updatedAt: listingDoc.data().updatedAt?.toDate(),
        } as Listing;
        setListing(listingData);

        if (listingData.categoryId) {
          const categoryDoc = await getDoc(doc(db, 'categories', listingData.categoryId));
          if (categoryDoc.exists()) {
            setCategory({ id: categoryDoc.id, ...categoryDoc.data() } as Category);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    if (!listing) return;
    
    const message = `Hola! Me interesa tu ${listing.type === 'product' ? 'producto' : 'servicio'}: *${listing.title}*. Lo vi en LaVitrinaPeru.`;
    const whatsappUrl = `https://wa.me/${listing.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
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
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-xl mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Publicación no encontrada</h1>
        <a href="/" className="text-primary-500 hover:underline">Volver al inicio</a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Gallery */}
        <div>
          <div className="relative h-96 bg-gray-200 rounded-xl overflow-hidden mb-4">
            <Image
  src={listing.images[selectedImage]}
  alt={listing.title}
  fill
  className="object-cover"
  priority
  unoptimized  // ← AGREGAR ESTO
/>
          </div>

          {listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 bg-gray-200 rounded-lg overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <Image
  src={image}
  alt={`${listing.title} ${index + 1}`}
  fill
  className="object-cover"
  unoptimized  // ← AGREGAR ESTO
/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            {category && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {category.icon} {category.name}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              listing.type === 'product' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {listing.type === 'product' ? 'Producto' : 'Servicio'}
            </span>
          </div>

          <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">
            {listing.title}
          </h1>

          <div className="text-4xl font-bold text-primary-500 mb-6">
            {listing.price}
          </div>

          <div className="prose prose-lg mb-6">
            <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
          </div>

          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {listing.tags.map((tag, index) => (
                <span key={index} className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 pb-8 border-b border-gray-200">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Publicado {listing.createdAt?.toLocaleDateString('es-PE')}
            </span>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleWhatsAppClick}
              className="w-full bg-whatsapp hover:bg-whatsapp-hover text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-5 h-5" />
              Quiero Comprar por WhatsApp
            </button>

            <button
              onClick={handleShare}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              Compartir
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>💡 Tip:</strong> Al contactar por WhatsApp, menciona que viste esta publicación en LaVitrinaPeru para obtener la mejor atención.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
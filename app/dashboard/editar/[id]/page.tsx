// app/dashboard/editar/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToCloudinary, deleteFromCloudinary, extractPublicId } from '@/lib/cloudinary';
import { Category, ListingType } from '@/types';
import { Upload, X, Loader, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function EditarPublicacionPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ListingType>('product');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  
  // Images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  
  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchListing();
    fetchCategories();
  }, [user, id]);

  const fetchListing = async () => {
    try {
      const listingDoc = await getDoc(doc(db, 'listings', id));
      
      if (!listingDoc.exists()) {
        setError('Publicación no encontrada');
        setLoading(false);
        return;
      }

      const data = listingDoc.data();

      // Verificar que sea dueño o admin
      if (data.merchantId !== user?.uid && !isAdmin) {
        setError('No tienes permiso para editar esta publicación');
        setLoading(false);
        return;
      }

      setTitle(data.title || '');
      setType(data.type || 'product');
      setDescription(data.description || '');
      setPrice(data.price || '');
      setCategoryId(data.categoryId || '');
      setTags(data.tags?.join(', ') || '');
      setWhatsapp(data.whatsapp || '');
      setExistingImages(data.images || []);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching listing:', error);
      setError('Error al cargar la publicación');
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const q = query(
        collection(db, 'categories'),
        where('active', '==', true),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const cats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Category[];
      setCategories(cats);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    const totalImages = existingImages.length + newImageFiles.length + files.length;
    if (totalImages > 5) {
      alert('Máximo 5 imágenes permitidas');
      return;
    }

    setNewImageFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = async (index: number) => {
    if (!confirm('¿Eliminar esta imagen?')) return;

    const imageUrl = existingImages[index];
    const publicId = extractPublicId(imageUrl);
    
    // Eliminar de Cloudinary
    await deleteFromCloudinary(publicId);
    
    // Eliminar del estado
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadNewImages = async (): Promise<string[]> => {
    if (newImageFiles.length === 0) return [];
    
    setUploadingImages(true);
    const urls: string[] = [];
    const folder = type === 'product' ? 'productos' : 'servicios';

    try {
      for (let i = 0; i < newImageFiles.length; i++) {
        setUploadProgress(Math.round(((i + 1) / newImageFiles.length) * 100));
        const url = await uploadToCloudinary(newImageFiles[i], folder, user!.uid);
        urls.push(url);
      }
    } catch (error) {
      throw new Error('Error subiendo imágenes');
    } finally {
      setUploadingImages(false);
      setUploadProgress(0);
    }

    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }
    if (!categoryId) {
      setError('Selecciona una categoría');
      return;
    }
    if (existingImages.length === 0 && newImageFiles.length === 0) {
      setError('Sube al menos una imagen');
      return;
    }

    setSaving(true);

    try {
      // Subir nuevas imágenes
      const newUploadedUrls = await uploadNewImages();
      
      // Combinar imágenes existentes con nuevas
      const allImages = [...existingImages, ...newUploadedUrls];

      // Actualizar documento
      await updateDoc(doc(db, 'listings', id), {
        title: title.trim(),
        type,
        description: description.trim(),
        price: price.trim(),
        images: allImages,
        categoryId,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        whatsapp: whatsapp.trim(),
        updatedAt: new Date(),
      });

      alert('Publicación actualizada exitosamente');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating listing:', error);
      setError('Error al actualizar la publicación');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (error && !title) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
        <Link href="/dashboard" className="text-primary-500 hover:underline">
          Volver al dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-primary-500 hover:text-primary-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver al dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-dark mb-2">
          Editar Publicación
        </h1>
        <p className="text-gray-600">
          Actualiza la información de tu publicación
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-md p-6">

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Publicación
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('product')}
              className={`p-4 border-2 rounded-lg font-medium transition-colors ${
                type === 'product'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              📦 Producto
            </button>
            <button
              type="button"
              onClick={() => setType('service')}
              className={`p-4 border-2 rounded-lg font-medium transition-colors ${
                type === 'service'
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              💼 Servicio
            </button>
          </div>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ej: iPhone 14 Pro Max 256GB"
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Describe tu producto o servicio en detalle..."
          />
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio *
          </label>
          <input
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Ej: S/ 100, Desde S/ 50, Consultar"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp *
          </label>
          <input
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="+51 999 999 999"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiquetas (opcional)
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="nuevo, importado, garantía (separados por comas)"
          />
        </div>

        {/* Imágenes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imágenes * (máximo 5)
          </label>
          
          <div className="grid grid-cols-3 md:grid-cols-5 gap-4 mb-4">
            {/* Imágenes existentes */}
            {existingImages.map((image, index) => (
              <div key={`existing-${index}`} className="relative aspect-square bg-cream-200 rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={`Imagen ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() => removeExistingImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Nuevas imágenes */}
            {newImagePreviews.map((preview, index) => (
              <div key={`new-${index}`} className="relative aspect-square bg-cream-200 rounded-lg overflow-hidden border-2 border-green-500">
                <Image
                  src={preview}
                  alt={`Nueva ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                  Nueva
                </div>
              </div>
            ))}
            
            {/* Agregar más */}
            {(existingImages.length + newImageFiles.length) < 5 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleNewImageChange}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Agregar</span>
              </label>
            )}
          </div>

          {/* Progress Bar */}
          {uploadingImages && (
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">Subiendo imágenes...</span>
                <span className="text-sm font-medium text-primary-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
          
          <p className="text-sm text-gray-500">
            Total: {existingImages.length + newImageFiles.length}/5 imágenes
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <Link
            href="/dashboard"
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors text-center"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || uploadingImages}
            className="flex-1 bg-primary-500 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {(saving || uploadingImages) && <Loader className="w-5 h-5 animate-spin" />}
            {uploadingImages ? 'Subiendo...' : saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
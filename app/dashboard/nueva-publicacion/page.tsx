// app/dashboard/nueva-publicacion/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { Category, User, ListingType } from '@/types';
import { Upload, X, Loader } from 'lucide-react';
import Image from 'next/image';

export default function NuevaPublicacionPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  
  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ListingType>('product');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  
  // Images
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [merchants, setMerchants] = useState<User[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Si es merchant, usar su propio whatsapp
    if (user.whatsapp && !isAdmin) {
      setWhatsapp(user.whatsapp);
    }

    // Si es merchant, asignarse a sí mismo
    if (!isAdmin) {
      setSelectedMerchantId(user.uid);
    }
    
    fetchCategories();
    
    // Si es admin, cargar lista de comerciantes
    if (isAdmin) {
      fetchMerchants();
    }
  }, [user, isAdmin, router]);

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

  const fetchMerchants = async () => {
    try {
      // Obtener todos los usuarios (merchants y admins)
      const snapshot = await getDocs(collection(db, 'users'));
      const allUsers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[];
      
      // Filtrar solo merchants activos
      const activeMerchants = allUsers.filter(u => 
        u.role === 'merchant' && u.active
      );
      setMerchants(activeMerchants);
    } catch (error) {
      console.error('Error fetching merchants:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (imageFiles.length + files.length > 5) {
      alert('Máximo 5 imágenes permitidas');
      return;
    }

    setImageFiles(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    
    setUploadingImages(true);
    const urls: string[] = [];
    const folder = type === 'product' ? 'productos' : 'servicios';

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100));
        const url = await uploadToCloudinary(imageFiles[i], folder);
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

    // Validaciones
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }
    if (!categoryId) {
      setError('Selecciona una categoría');
      return;
    }
    if (!whatsapp.trim()) {
      setError('El número de WhatsApp es requerido');
      return;
    }
    if (imageFiles.length === 0) {
      setError('Sube al menos una imagen');
      return;
    }
    if (isAdmin && !selectedMerchantId) {
      setError('Selecciona un comerciante para esta publicación');
      return;
    }

    setLoading(true);

    try {
      const imageUrls = await uploadImages();

      // Determinar el merchantId
      const merchantId = isAdmin ? selectedMerchantId : user!.uid;

      const listingData = {
        title: title.trim(),
        type,
        description: description.trim(),
        price: price.trim(),
        images: imageUrls,
        categoryId,
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        merchantId,
        whatsapp: whatsapp.trim(),
        featured: false,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'listings'), listingData);
      
      // Redirigir según rol
      if (isAdmin) {
        router.push('/admin/publicaciones');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setError('Error al crear la publicación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-gray-900 mb-2">
          Nueva Publicación
        </h1>
        <p className="text-gray-600">
          {isAdmin 
            ? 'Crea una publicación y asígnala a un comerciante' 
            : 'Completa el formulario para publicar tu producto o servicio'
          }
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-md p-6">

        {/* Selector de Comerciante (Solo Admin) */}
        {isAdmin && (
          <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <label className="block text-sm font-bold text-primary-700 mb-2">
              👤 Asignar a Comerciante *
            </label>
            <select
              value={selectedMerchantId}
              onChange={(e) => {
                setSelectedMerchantId(e.target.value);
                // Auto-rellenar WhatsApp si el merchant lo tiene
                const merchant = merchants.find(m => m.uid === e.target.value);
                if (merchant?.whatsapp) {
                  setWhatsapp(merchant.whatsapp);
                }
              }}
              required
              className="w-full px-4 py-3 border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              <option value="">Selecciona un comerciante</option>
              {merchants.map(merchant => (
                <option key={merchant.uid} value={merchant.uid}>
                  {merchant.displayName || merchant.email} — {merchant.email}
                </option>
              ))}
            </select>
            {merchants.length === 0 && (
              <p className="mt-2 text-sm text-primary-600">
                ⚠️ No hay comerciantes registrados aún.
              </p>
            )}
          </div>
        )}

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
          <p className="mt-1 text-sm text-gray-500">
            Número que recibirá los mensajes de clientes
          </p>
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
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            {imageFiles.length < 5 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <Upload className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Subir</span>
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
          
          <p className="text-sm text-gray-500">JPG, PNG. Máx 5MB por imagen</p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="flex-1 bg-primary-500 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {(loading || uploadingImages) && <Loader className="w-5 h-5 animate-spin" />}
            {uploadingImages ? 'Subiendo imágenes...' : loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </form>
    </div>
  );
}
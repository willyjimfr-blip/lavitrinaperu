// lib/cloudinary.ts

// Subir imagen a Cloudinary
export async function uploadToCloudinary(
  file: File,
  folder: string,
  merchantId?: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
  
  const fullPath = merchantId
    ? `sumawil/vendors/${merchantId}/${folder}`
    : `sumawil/${folder}`;
  
  formData.append('folder', fullPath);

  // Transformaciones automáticas via upload preset
  formData.append('quality', 'auto');
  formData.append('fetch_format', 'auto');

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) throw new Error('Error al subir imagen');
  
  const data = await response.json();
  return data.secure_url;
}

// Obtener URL optimizada según el uso
export function getOptimizedUrl(url: string, type: 'card' | 'detail' | 'thumb' = 'card'): string {
  if (!url || !url.includes('cloudinary.com')) return url;

  const transformations = {
    card:   'w_400,h_400,c_fill,g_auto,q_auto,f_auto',
    detail: 'w_1200,h_900,c_limit,q_auto,f_auto',
    thumb:  'w_100,h_100,c_fill,q_auto,f_auto',
  };

  return url.replace('/upload/', `/upload/${transformations[type]}/`);
}

// Extraer public_id de una URL de Cloudinary
export function extractPublicId(url: string): string {
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
  return publicIdWithExtension.replace(/\.[^/.]+$/, '');
}

// Eliminar imagen de Cloudinary
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}
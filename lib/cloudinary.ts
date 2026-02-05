// lib/cloudinary.ts
export async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
  formData.append('folder', `lavitrinaperu/${folder}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Error al subir imagen a Cloudinary');
  }

  const data = await response.json();
  return data.secure_url;
}

export function extractPublicId(url: string): string {
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
  return publicIdWithExtension.replace(/\.[^/.]+$/, '');
}

export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return false;
  }
}
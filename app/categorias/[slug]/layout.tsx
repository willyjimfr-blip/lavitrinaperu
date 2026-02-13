// app/categoria/[slug]/layout.tsx
import { Metadata } from 'next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  try {
    const q = query(
      collection(db, 'categories'),
      where('slug', '==', params.slug)
    );
    const snap = await getDocs(q);
    
    if (snap.empty) {
      return { title: 'Categoría no encontrada' };
    }

    const category = snap.docs[0].data();

    return {
      title: `${category.icon} ${category.name} en Perú`,
      description: `Encuentra los mejores ${category.name} de comerciantes peruanos en Sumawil. Compra directo por WhatsApp.`,
      openGraph: {
        title: `${category.name} | Sumawil`,
        description: `Encuentra los mejores ${category.name} en Perú`,
      },
    };
  } catch {
    return { title: 'Sumawil' };
  }
}

export default function CategoriaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
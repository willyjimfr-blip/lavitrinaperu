// app/layout.tsx
import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sumawil - Marketplace de Productos y Servicios Peruanos',
  description: 'Descubre y compra productos y servicios de comerciantes peruanos. Marketplace local, compra directa por WhatsApp.',
  keywords: 'marketplace peru, productos peru, servicios peru, compra whatsapp, comercio local, sumawil',
  authors: [{ name: 'Sumawil' }],
  openGraph: {
    title: 'Sumawil - Marketplace de Productos y Servicios Peruanos',
    description: 'Descubre y compra productos y servicios de comerciantes peruanos',
    type: 'website',
    locale: 'es_PE',
    siteName: 'Sumawil',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${outfit.variable} ${inter.variable}`}>
      <body className="font-body antialiased bg-cream-100">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
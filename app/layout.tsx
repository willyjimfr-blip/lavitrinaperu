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
  metadataBase: new URL('https://sumawil.com'),
  title: {
    default: 'Sumawil - Marketplace de Productos y Servicios Peruanos',
    template: '%s | Sumawil',
  },
  description: 'Descubre y compra productos y servicios de comerciantes peruanos. Marketplace local, compra directa por WhatsApp. Encuentra tecnología, moda, hogar, alimentos y más.',
  keywords: [
    'marketplace peru',
    'productos peruanos',
    'servicios peru',
    'compra whatsapp',
    'comercio local peru',
    'sumawil',
    'tienda online peru',
    'vendedores peru',
  ],
  authors: [{ name: 'Sumawil', url: 'https://sumawil.com' }],
  creator: 'Sumawil',
  publisher: 'Sumawil',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    url: 'https://sumawil.com',
    siteName: 'Sumawil',
    title: 'Sumawil - Marketplace de Productos y Servicios Peruanos',
    description: 'Descubre y compra productos y servicios de comerciantes peruanos directamente por WhatsApp.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Sumawil - Marketplace Peruano',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sumawil - Marketplace Peruano',
    description: 'Descubre y compra productos y servicios de comerciantes peruanos.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  verification: {
    google: 'vA4KLHxSDh80NOTRpR8J7nEcOUUD2-qYi346jrlBo-I', // Opcional
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
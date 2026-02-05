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
  title: 'LaVitrinaPeru - Marketplace de Productos y Servicios',
  description: 'Descubre y compra productos y servicios de comerciantes peruanos. Marketplace local, compra directa por WhatsApp.',
  keywords: 'marketplace peru, productos peru, servicios peru, compra whatsapp, comercio local',
  authors: [{ name: 'LaVitrinaPeru' }],
  openGraph: {
    title: 'LaVitrinaPeru - Marketplace de Productos y Servicios',
    description: 'Descubre y compra productos y servicios de comerciantes peruanos',
    type: 'website',
    locale: 'es_PE',
    siteName: 'LaVitrinaPeru',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${outfit.variable} ${inter.variable}`}>
      <body className="font-body antialiased bg-gray-50">
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
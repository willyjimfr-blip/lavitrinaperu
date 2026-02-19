// types/index.ts

export type UserRole = 'admin' | 'merchant' | 'pending';

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  whatsapp?: string;
  active: boolean;
  createdAt: Date;
}

export type ListingType = 'product' | 'service';

export interface Listing {
  id: string;
  title: string;
  type: ListingType;
  description: string;
  price: string;
  images: string[];
  categoryId: string;
  tags: string[];
  merchantId: string;
  whatsapp: string;
  featured: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  order: number;
  active: boolean;
}
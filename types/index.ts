// types/index.ts
export type UserRole = 'admin' | 'merchant' | 'pending'; // ← Agregar 'pending'

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
  whatsapp?: string;
  active: boolean;
  createdAt: Date;
}

// ... resto del archivo igual
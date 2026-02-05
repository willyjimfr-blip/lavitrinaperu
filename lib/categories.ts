import { Category } from '@/types';

export const defaultCategories: Category[] = [
  {
    id: 'comida',
    name: 'Comida y Bebidas',
    slug: 'comida',
    icon: '🍽️',
    active: true,
    order: 1,
  },
  {
    id: 'moda',
    name: 'Moda y Accesorios',
    slug: 'moda',
    icon: '👕',
    active: true,
    order: 2,
  },
  {
    id: 'regalos',
    name: 'Regalos y Detalles',
    slug: 'regalos',
    icon: '🎁',
    active: true,
    order: 3,
  },
  {
    id: 'hogar',
    name: 'Hogar y Decoración',
    slug: 'hogar',
    icon: '🏠',
    active: true,
    order: 4,
  },
  {
    id: 'servicios',
    name: 'Servicios',
    slug: 'servicios',
    icon: '🛠️',
    active: true,
    order: 5,
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    slug: 'tecnologia',
    icon: '📱',
    active: true,
    order: 6,
  },
];

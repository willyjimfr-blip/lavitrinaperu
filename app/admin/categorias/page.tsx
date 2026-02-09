'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import AdminRoute from '@/components/AdminRoute';
import Link from 'next/link';
import { Plus, Edit2, Trash2, Save, X, ArrowLeft } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  active: boolean;
}

export default function CategoriasAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    order: 0,
    active: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const q = query(collection(db, 'categories'), orderBy('order'));
      const snapshot = await getDocs(q);
      const cats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      // Validar
      if (!formData.name || !formData.slug || !formData.icon) {
        alert('Completa todos los campos');
        return;
      }

      await addDoc(collection(db, 'categories'), {
        name: formData.name,
        slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
        icon: formData.icon,
        order: formData.order,
        active: formData.active,
      });

      // Resetear form
      setFormData({ name: '', slug: '', icon: '', order: 0, active: true });
      setAdding(false);
      loadCategories();
      alert('✅ Categoría creada exitosamente');
    } catch (error) {
      console.error('Error adding category:', error);
      alert('❌ Error al crear categoría');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const category = categories.find((c) => c.id === id);
      if (!category) return;

      await updateDoc(doc(db, 'categories', id), {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
        order: category.order,
        active: category.active,
      });

      setEditing(null);
      alert('✅ Categoría actualizada');
    } catch (error) {
      console.error('Error updating category:', error);
      alert('❌ Error al actualizar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await deleteDoc(doc(db, 'categories', id));
      loadCategories();
      alert('✅ Categoría eliminada');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('❌ Error al eliminar');
    }
  };

  const updateCategory = (id: string, field: string, value: any) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, [field]: value } : cat
      )
    );
  };

  return (
    <AdminRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href="/admin"
                  className="text-primary-500 hover:text-primary-700 font-medium mb-2 inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Volver al dashboard
                </Link>
                <h1 className="text-3xl font-display font-bold text-gray-900">
                  Gestión de Categorías
                </h1>
              </div>
              <button
                onClick={() => setAdding(true)}
                className="bg-primary-500 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Nueva Categoría
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Formulario Nueva Categoría */}
          {adding && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-2 border-primary-500">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Nueva Categoría
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: Tecnología"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: tecnologia"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icono (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej: 💻"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleAdd}
                  className="bg-primary-500 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Guardar
                </button>
                <button
                  onClick={() => setAdding(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <X className="w-5 h-5" />
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de Categorías */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Icono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      {editing === cat.id ? (
                        <input
                          type="number"
                          value={cat.order}
                          onChange={(e) =>
                            updateCategory(
                              cat.id,
                              'order',
                              parseInt(e.target.value)
                            )
                          }
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="font-medium">{cat.order}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-2xl">
                      {editing === cat.id ? (
                        <input
                          type="text"
                          value={cat.icon}
                          onChange={(e) =>
                            updateCategory(cat.id, 'icon', e.target.value)
                          }
                          className="w-16 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        cat.icon
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editing === cat.id ? (
                        <input
                          type="text"
                          value={cat.name}
                          onChange={(e) =>
                            updateCategory(cat.id, 'name', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">
                          {cat.name}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editing === cat.id ? (
                        <input
                          type="text"
                          value={cat.slug}
                          onChange={(e) =>
                            updateCategory(cat.id, 'slug', e.target.value)
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        <span className="text-gray-600">{cat.slug}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editing === cat.id ? (
                        <select
                          value={cat.active ? 'true' : 'false'}
                          onChange={(e) =>
                            updateCategory(
                              cat.id,
                              'active',
                              e.target.value === 'true'
                            )
                          }
                          className="px-2 py-1 border border-gray-300 rounded"
                        >
                          <option value="true">Activa</option>
                          <option value="false">Inactiva</option>
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            cat.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {cat.active ? 'Activa' : 'Inactiva'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {editing === cat.id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(cat.id)}
                              className="text-green-600 hover:text-green-800 p-1"
                              title="Guardar"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setEditing(null);
                                loadCategories();
                              }}
                              className="text-gray-600 hover:text-gray-800 p-1"
                              title="Cancelar"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditing(cat.id)}
                              className="text-primary-600 hover:text-primary-800 p-1"
                              title="Editar"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Eliminar"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}s
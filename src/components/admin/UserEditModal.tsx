import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Save, Plus } from 'lucide-react';

interface UserProfile {
  id?: string; // ahora es opcional
  full_name: string | null;
  role: string;
  rating?: number;
  number_phone: string | null;
  user_name: string | null;
  user_password: string | null;
}

interface UserEditModalProps {
  user?: UserProfile; // puede ser undefined para crear
  onSave: () => void;
  onCancel: () => void;
}

export function UserEditModal({ user, onSave, onCancel }: UserEditModalProps) {
  const isEditMode = !!user?.id;

  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    role: user?.role || 'user',
    number_phone: user?.number_phone || '',
    user_name: user?.user_name || '',
    user_password: user?.user_password || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isEditMode) {
        // 🔄 Actualizar usuario
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name || null,
            role: formData.role,
            number_phone: formData.number_phone || null,
            user_name: formData.user_name || null,
            user_password: formData.user_password || null,
          })
          .eq('id', user!.id);

        if (error) throw error;
      } else {
        // ➕ Crear usuario
        const { error } = await supabase.from('profiles').insert([
          {
            full_name: formData.full_name || null,
            role: formData.role,
            number_phone: formData.number_phone || null,
            user_name: formData.user_name || null,
            user_password: formData.user_password || null,
            rating: 5, // valor por defecto
          },
        ]);

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error guardando usuario:', error);
      alert('Error al guardar el usuario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditMode ? 'Editar Usuario' : 'Crear Usuario'}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre completo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre Completo
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Nombre del usuario"
              required
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              value={formData.number_phone}
              onChange={(e) => setFormData({ ...formData, number_phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Número de teléfono"
            />
          </div>

          {/* Nombre de usuario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de Usuario
            </label>
            <input
              type="text"
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="ejemplo.usuario"
              required
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={formData.user_password}
              onChange={(e) => setFormData({ ...formData, user_password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="••••••••"
              required={!isEditMode} // requerido solo al crear
            />
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isEditMode ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Guardando...' : 'Guardar'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  {saving ? 'Creando...' : 'Crear Usuario'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

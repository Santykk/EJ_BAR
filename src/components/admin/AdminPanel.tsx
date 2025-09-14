import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import { Settings, Users, Building, Table, Save, Trash2, Edit2 } from 'lucide-react';
import { UserEditModal } from './UserEditModal';

interface UserProfile {
  id: string;
  full_name: string | null;
  role: string;
  rating: number;
  number_phone: string | null;
}

// ... imports iguales
export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('company');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const { settings, loading, updateSettings } = useCompanySettings();

  const [formData, setFormData] = useState({
    company_name: '',
    max_tables: 12,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData({
        company_name: settings.company_name,
        max_tables: settings.max_tables,
      });
    }
  }, [settings]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const saveCompanySettings = async () => {
    setSaving(true);
    try {
      const success = await updateSettings({
        company_name: formData.company_name,
        max_tables: formData.max_tables,
      });
      alert(success ? 'Configuración guardada exitosamente' : 'Error al guardar la configuración');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleUserSaved = () => {
    setEditingUser(null);
    loadUsers();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      loadUsers();
      alert('Usuario eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar el usuario');
    }
  };

  const tabs = [
    { id: 'company', name: 'Empresa', icon: Building },
    { id: 'tables', name: 'Mesas', icon: Table },
    { id: 'users', name: 'Usuarios', icon: Users },
  ];

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Settings className="w-8 h-8 mr-3 text-green-600" />
          Panel de Administrador
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Tabs responsivos */}
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex min-w-max space-x-4 sm:space-x-8 px-4 sm:px-6">
            {tabs.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {/* Tab: Empresa */}
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Configuración de la Empresa</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) =>
                      setFormData({ ...formData, company_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número Máximo de Mesas
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={formData.max_tables}
                    onChange={(e) =>
                      setFormData({ ...formData, max_tables: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <button
                onClick={saveCompanySettings}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          )}

          {/* Tab: Mesas */}
          {activeTab === 'tables' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Mesas</h3>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  <strong>Mesas configuradas:</strong> {settings?.max_tables || 12} mesas
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Puedes cambiar el número de mesas en la configuración de la empresa.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {Array.from({ length: settings?.max_tables || 12 }, (_, i) => i + 1).map(
                  (tableNumber) => (
                    <div
                      key={tableNumber}
                      className="p-4 border-2 border-gray-200 rounded-lg text-center bg-gray-50 w-[90px] sm:w-[100px]"
                    >
                      <div className="text-sm font-bold text-gray-700">Mesa {tableNumber}</div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Tab: Usuarios */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{user.full_name || 'Sin nombre'}</div>
                            <div className="text-xs text-gray-500">{user.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.number_phone || 'No especificado'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.rating}/5</td>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onSave={handleUserSaved}
          onCancel={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}

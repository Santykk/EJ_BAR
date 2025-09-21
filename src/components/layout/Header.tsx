import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import { LogOut, BarChart3, Settings } from 'lucide-react';

interface HeaderProps {
  onAdminPanelClick?: () => void;
}

export function Header({ onAdminPanelClick }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { isAdmin, loading } = useUserProfile();
  const { settings } = useCompanySettings();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="bg-green-600 rounded-lg p-2 mr-3">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {settings?.company_name || 'BarManager'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {!loading && isAdmin && (
              <button
                onClick={onAdminPanelClick}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Panel Admin
              </button>
            )}
            <span className="text-sm text-gray-600">
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
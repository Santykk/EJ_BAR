import React, { useState } from 'react';
import { Header } from './layout/Header';
import { Navigation } from './layout/Navigation';
import { Dashboard as DashboardView } from './dashboard/Dashboard';
import { InventoryManager } from './inventory/InventoryManager';
import { SalesManager } from './sales/SalesManager';
import { SalesHistory } from './sales/SalesHistory';
import { AdminPanel } from './admin/AdminPanel';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'inventory':
        return <InventoryManager />;
      case 'sales':
        return <SalesManager />;
      case 'history':
        return <SalesHistory />;
      case 'admin':
        return <AdminPanel />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header fijo en la parte superior */}
      <Header onAdminPanelClick={() => setActiveTab('admin')} />

      {/* Navegación horizontal o lateral (según diseño) */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Contenido principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
    </div>
  );
}

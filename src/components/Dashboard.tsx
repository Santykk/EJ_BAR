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
    <div className="min-h-screen bg-gray-50">
      <Header onAdminPanelClick={() => setActiveTab('admin')} />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
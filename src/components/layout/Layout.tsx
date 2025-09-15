import React, { useState } from "react";
import { Header } from "./Header";
import { Navigation } from "./Navigation";

export function Layout({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header arriba */}
      <Header onAdminPanelClick={() => setActiveTab("admin")} />

      {/* Barra de navegación debajo del header */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Contenido dinámico */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}

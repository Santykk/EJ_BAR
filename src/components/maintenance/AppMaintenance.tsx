// src/maintenance/AppMaintenance.tsx
import React from "react";

function AppMaintenance() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        🚧 Sitio en mantenimiento
      </h1>
      <p className="text-gray-600 text-lg mb-6">
        Estamos trabajando para mejorar tu experiencia. <br />
        Vuelve a intentarlo más tarde.
      </p>
      <span className="px-4 py-2 bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium shadow">
        Modo mantenimiento activo
      </span>
    </div>
  );
}

export default AppMaintenance;

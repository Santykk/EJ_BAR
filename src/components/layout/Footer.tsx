import React from "react";

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full 
      bg-white/20 backdrop-blur-lg shadow-lg border-t border-white/30 
      text-gray-900 dark:text-gray-100 text-center py-3 text-sm z-50">
      <p className="font-medium tracking-wide">
        🌐 Desarrollado por <span className="text-green-600">TuNombre</span> © {new Date().getFullYear()}
      </p>
    </footer>
  );
}

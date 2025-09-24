import React from "react";

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-gray-900/70 text-white text-center py-2 text-sm z-50">
      <p>Desarrollado por TuNombre © {new Date().getFullYear()}</p>
    </footer>
  );
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AppMaintenance from './components/maintenance/AppMaintenance.tsx';
import './index.css';

// Lee la variable de entorno (si es "true", activa mantenimiento)
const isMaintenance = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isMaintenance ? <AppMaintenance /> : <App />}
  </StrictMode>
);

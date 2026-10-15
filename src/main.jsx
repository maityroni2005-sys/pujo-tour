import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'leaflet/dist/leaflet.css';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext';
import { AppDataProvider } from './context/AppDataContext';
import { ToastProvider } from './context/ToastContext';
import { GlobalErrorBoundary } from './components/GlobalErrorBoundary';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New Durga Puja crowd updates & features are available! Reload now?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('✨ UtsavHopper is offline ready! Itineraries and pandal maps are now cached on this device.');
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppDataProvider>
            <App />
          </AppDataProvider>
        </AuthProvider>
      </ToastProvider>
    </GlobalErrorBoundary>
  </StrictMode>
);

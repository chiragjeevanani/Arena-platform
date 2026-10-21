import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './modules/user/context/ThemeContext'
import { AuthProvider } from './modules/user/context/AuthContext'
import { CartProvider } from './modules/user/context/CartContext'
import AppErrorBoundary, { reloadForNewVersion } from './components/AppErrorBoundary'

// Vite fires this when a lazily loaded page can't be fetched — e.g. the phone still has the
// previous version's index.html and that version's files were replaced by a deploy.
// Reloading picks up the new version instead of showing a blank screen.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadForNewVersion()) event.preventDefault();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </AppErrorBoundary>
  </StrictMode>,
)

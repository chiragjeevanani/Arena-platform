import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './modules/user/context/ThemeContext'
import { AuthProvider } from './modules/user/context/AuthContext'
import { CartProvider } from './modules/user/context/CartContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)

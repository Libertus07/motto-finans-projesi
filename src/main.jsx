// src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 👇 Vercel Speed Insights ve Analytics
import { injectSpeedInsights } from "@vercel/speed-insights"
import { Analytics } from "@vercel/analytics/react"

// Vercel Speed Insights'ı client-side'da başlat (Vite + React için)
injectSpeedInsights();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* Analytics arka planda sessizce çalışır */}
    <Analytics />
  </StrictMode>,
)
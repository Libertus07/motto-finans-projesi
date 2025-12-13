// src/main.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 👇 Vercel Performans ve Analiz Araçları
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from "@vercel/analytics/react"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    {/* Bu araçlar arka planda sessizce çalışır */}
    <SpeedInsights />
    <Analytics />
  </StrictMode>,
)
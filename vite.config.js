import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel'da kaynak dosyalarının (JS/CSS) doğru yüklenmesi için base ayarı eklendi.
export default defineConfig({
  plugins: [react()],
});
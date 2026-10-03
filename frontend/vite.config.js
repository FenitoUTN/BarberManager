import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // En local y en el backend servido por Express el sitio vive en '/'. En GitHub Pages
  // vive en '/BarberManager/', y sin este prefijo el HTML pediría /assets/* contra el
  // dominio raíz: página en blanco. Lo define el deploy, no el código.
  base: process.env.VITE_BASE || '/',
  server: {
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})

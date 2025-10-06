import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    proxy: {
      '/api': {
        target: 'https://hrapp-9m69.onrender.com',
        changeOrigin: true
      },
      '/avatar': {
        target: 'https://hrapp-9m69.onrender.com',
        changeOrigin: true
      },
      '/employeesFiles': {
        target: 'https://hrapp-9m69.onrender.com',
        changeOrigin: true
      }
    }
  }
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://localhost:7288',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'components': path.resolve(__dirname, './src/components'),
      'pages': path.resolve(__dirname, './src/pages'),
      'services': path.resolve(__dirname, './src/services'),
      'utils': path.resolve(__dirname, './src/utils'),
      'hooks': path.resolve(__dirname, './src/hooks'),
      'config': path.resolve(__dirname, './src/config'),
      'contexts': path.resolve(__dirname, './src/contexts'),
      'reduxComponents': path.resolve(__dirname, './src/reduxComponents'),
      'assets': path.resolve(__dirname, './src/assets'),
      'types': path.resolve(__dirname, './src/types')
    }
  },
  define: {
    global: 'globalThis',
  }
})
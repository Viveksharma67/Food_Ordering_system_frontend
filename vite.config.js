import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendUrl = env.VITE_API_URL || 'http://localhost:3000'

  return {
    plugins: [react()],
    server: {
      port: 3001,
      host: true,  // ✅ frontend bhi network pe accessible hoga
      proxy: {
        '/api': {
          target: backendUrl,  // ✅ env se backend URL lega
          changeOrigin: true,
        },
        '/uploads': {
          target: backendUrl,  // ✅ images bhi proxy hongi
          changeOrigin: true,
        }
      }
    }
  }
})
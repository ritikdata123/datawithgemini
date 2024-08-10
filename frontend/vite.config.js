import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    port: parseInt(process.env.PORT as string),
    host: "0.0.0.0",
    cors: true
  }
})

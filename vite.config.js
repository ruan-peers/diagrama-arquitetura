import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: O 'base' deve ser o nome do seu repositório no GitHub entre barras.
  // Baseado no seu link anterior (ruan-peers.github.io/diagrama-arquitetura/), o valor deve ser:
  base: '/diagrama-arquitetura/',
})

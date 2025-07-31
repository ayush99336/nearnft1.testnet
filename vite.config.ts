import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      process: 'process/browser',
      buffer: 'buffer',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {}, // Prevents crashing when trying to access env vars
  },
  optimizeDeps: {
    include: ['process', 'buffer'],
  },
});

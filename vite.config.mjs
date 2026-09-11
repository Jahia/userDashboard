import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: true,
    outDir: path.resolve('target/frontend-dist'),
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve('src/main/frontend/edit-user-details/main.jsx'),
      output: {
        entryFileNames: 'edit-user-details-app.js',
        assetFileNames: assetInfo => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'edit-user-details-app.css';
          }

          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});

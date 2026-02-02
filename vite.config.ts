
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import process from 'process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  // Explicitly using the imported process to satisfy TypeScript types and avoid errors about 'cwd' missing on global process
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(__dirname, './'),
      },
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});

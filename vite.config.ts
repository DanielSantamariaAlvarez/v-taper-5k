import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration for V-Taper 5K application
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/v-taper-5k/' : '/',
  plugins: [react()],
}));

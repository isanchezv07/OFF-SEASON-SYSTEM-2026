import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  server: {
    host: true, // Enable access from local network
    port: 4321,
    watch: {
      ignored: ['**/server/**'],
    },
  },
  output: 'server', // Enable SSR for authentication
  devToolbar: {
    enabled: false,
  },
});
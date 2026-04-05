// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://talkingtomachines.xyz',
  output: 'server',
  adapter: vercel(),
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/admin') &&
        !page.includes('/success') &&
        !page.includes('/restore') &&
        !page.includes('/share-card') &&
        !page.includes('/gottm-link') &&
        !page.includes('/api/'),
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          hi: 'hi',
          es: 'es',
          pt: 'pt',
          ar: 'ar',
          fr: 'fr',
          id: 'id',
          bn: 'bn',
          te: 'te',
          ta: 'ta',
          mr: 'mr',
          kn: 'kn',
          gu: 'gu',
          ja: 'ja',
          ko: 'ko',
          de: 'de',
          zh: 'zh',
          tr: 'tr',
          vi: 'vi',
        },
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      target: 'es2020',
    },
  }
});
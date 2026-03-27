import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@vue/devtools-core',
        '@vue/devtools-kit',
        'markdown-it',
      ]
    }

  },
  runtimeConfig: {
    strapiToken: process.env.STRAPI_TOKEN || '',
    strapiInternalUrl:
      process.env.NUXT_STRAPI_INTERNAL_URL
      || process.env.NUXT_PUBLIC_STRAPI_URL
      || 'http://localhost:1337',
    public: {
      strapiUrl: process.env.NUXT_PUBLIC_STRAPI_URL || 'http://localhost:1337',
    },
  },
  app: {
    head: {
      title: 'Blog Tech Headless',
      meta: [
        {
          name: 'description',
          content: 'Front Nuxt SSR pour afficher les articles, auteurs et catégories exposés par Strapi.',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,500,0,0&display=swap',
        },
      ],
    },
  },
})

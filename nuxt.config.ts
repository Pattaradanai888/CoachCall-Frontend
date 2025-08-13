// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@vueuse/motion/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@samk-dev/nuxt-vcalendar',
  ],
  devtools: { enabled: true },
  
  runtimeConfig: {
    backendUrl: process.env.BACKEND_URL || 'https://coach-call-fastapi.southeastasia.cloudapp.azure.com',
    apiBase: process.env.API_BASE || 'http://localhost:8000',

    public: {
      apiBase: '/api',
    },
  },
  
  compatibilityDate: '2024-11-01',
  
  image: {
    format: ['avif', 'webp', 'png', 'jpg'],
    quality: 80,
    screens: {
      sm: 320,
      md: 640,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    domains: ['coachcall.blob.core.windows.net'],
    densities: [1, 2],
    // Add presets for common image sizes
    presets: {
      avatar: {
        modifiers: {
          format: 'webp',
          width: 48,
          height: 48,
          fit: 'cover',
        },
      },
      profile: {
        modifiers: {
          format: 'webp',
          width: 112,
          height: 112,
          fit: 'cover',
        },
      },
      course: {
        modifiers: {
          format: 'webp',
          width: 400,
          height: 225,
          fit: 'cover',
        },
      },
    },
  },
  
  routeRules: {
    '/api/**': { 
      headers: { 
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie'
      },
      cors: true 
    },
    
    // Your existing caching rules
    // Cache static assets for 1 year
    '/images/**': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
      },
    },
    // Cache profile images for 1 day
    '/_ipx/**': {
      headers: {
        'cache-control': 'public, max-age=86400',
      },
    },
    // Cache default images for 1 year
    '/default-profile.jpg': {
      headers: {
        'cache-control': 'public, max-age=31536000, immutable',
      },
    },
  },
  
  nitro: {
  preset: 'azure-swa',
    
    azure: {
      config: {
        navigationFallback: {
          rewrite: '/200.html'
        }
      }
    }
  },
});
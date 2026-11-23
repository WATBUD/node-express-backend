export const DEFAULT_CORS_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'https://nextshadcn14.vercel.app',
  'https://watchlab-lovat.vercel.app',
  'https://survival-equation-web.vercel.app',
]

export const buildCorsOptions = (extraOrigins = process.env.CORS_ORIGINS || '') => ({
  origin: [...new Set([...DEFAULT_CORS_ORIGINS, ...extraOrigins.split(',').map(value => value.trim()).filter(Boolean)])],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
})

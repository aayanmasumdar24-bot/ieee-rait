import cors from 'cors'

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://ieee-rait.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[]

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
})

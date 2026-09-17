import express from 'express'
import { corsMiddleware } from './middleware/cors'
import { contactRouter } from './routes/contact'
import { healthRouter } from './routes/health'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())
app.use(corsMiddleware)

app.use('/health', healthRouter)
app.use('/api/contact', contactRouter)

app.listen(PORT, () => {
  console.log(`IEEE RAIT API → http://localhost:${PORT}`)
})

export default app

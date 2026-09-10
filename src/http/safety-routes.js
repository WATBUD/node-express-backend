import express from 'express'
import { rateLimit } from 'express-rate-limit'

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: req => String(req.user.user_id),
  handler: (_req, res) => res.status(429).json({ success: false, error: { code: 'SAFETY_REPORT_RATE_LIMITED', message: 'SAFETY_REPORT_RATE_LIMITED' } }),
})

export default handler => {
  const router = express.Router()
  router.post('/reports', reportLimiter, handler.createReport)
  return router
}

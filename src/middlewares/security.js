import { ipKeyGenerator, rateLimit } from 'express-rate-limit'

const limited = (code, message) => (_req, res, _next, options) =>
  res.status(options.statusCode).json({
    success: false,
    error: { code, message },
  })

const base = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
}

const clientKey = req => ipKeyGenerator(req.ip || req.socket.remoteAddress || '')
const normalized = value => String(value || '').trim().toLowerCase()

export const globalLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 500,
  handler: limited(
    'GLOBAL_RATE_LIMITED',
    'Too many requests. Please try again later.',
  ),
})

export const verificationIpLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 8,
  handler: limited(
    'VERIFICATION_IP_RATE_LIMITED',
    'Too many verification email requests. Please try again later.',
  ),
})

export const verificationDestinationLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  keyGenerator: req => normalized(req.body?.destination),
  handler: limited(
    'VERIFICATION_DESTINATION_RATE_LIMITED',
    'Too many verification emails were sent to this address. Please try again later.',
  ),
})

export const registrationLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  handler: limited(
    'REGISTRATION_RATE_LIMITED',
    'Too many account creation attempts. Please try again later.',
  ),
})

export const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  keyGenerator: req => `${clientKey(req)}:${normalized(req.body?.account)}`,
  handler: limited(
    'LOGIN_RATE_LIMITED',
    'Too many failed sign-in attempts. Please try again later.',
  ),
})

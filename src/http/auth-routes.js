import express from 'express'
import { validateRequestBody } from '../dto/joi-help.js'
import { loginDto, registerDto, verificationRequestDto } from '../dto/auth-request-dto.js'

export default handler => {
  const router = express.Router()
  router.post('/api/auth/verification/request', validateRequestBody(verificationRequestDto, { abortEarly: false }), handler.requestVerification)
  router.post('/api/auth/register', validateRequestBody(registerDto, { abortEarly: false }), handler.register)
  router.post('/api/auth/login', validateRequestBody(loginDto, { abortEarly: false }), handler.login)
  router.get('/api/auth/me', handler.me)
  return router
}

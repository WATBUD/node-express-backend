import express from 'express'
import { validateRequestBody } from '../dto/joi-help.js'
import { loginDto, registerDto, verificationRequestDto } from '../dto/auth-request-dto.js'
import {
  loginLimiter,
  registrationLimiter,
  verificationDestinationLimiter,
  verificationIpLimiter,
} from '../middlewares/security.js'

export default handler => {
  const router = express.Router()
  /**
   * @swagger
   * /api/auth/verification/request:
   *   post:
   *     tags: [Authentication]
   *     summary: 寄送 Email 驗證碼
   *     description: 驗證信寄出成功後不會在正式環境回傳驗證碼。重複請求會受到頻率限制。
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [channel, destination]
   *             properties:
   *               channel:
   *                 type: string
   *                 enum: [email]
   *                 example: email
   *               destination:
   *                 type: string
   *                 format: email
   *                 example: user@example.com
   *     responses:
   *       200:
   *         description: 驗證信已送出
   *       400:
   *         description: 請求資料格式錯誤
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       429:
   *         description: 請求過於頻繁
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       502:
   *         description: Email 寄送失敗
   */
  router.post(
    '/api/auth/verification/request',
    verificationIpLimiter,
    verificationDestinationLimiter,
    validateRequestBody(verificationRequestDto, { abortEarly: false }),
    handler.requestVerification,
  )
  /**
   * @swagger
   * /api/auth/register:
   *   post:
   *     tags: [Authentication]
   *     summary: 建立 INI Dating 帳號
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [channel, account, email, password, verificationCode, birthdate]
   *             properties:
   *               channel: { type: string, enum: [email], example: email }
   *               account: { type: string, format: email, example: user@example.com }
   *               phone: { type: string, example: '' }
   *               email: { type: string, format: email, example: user@example.com }
   *               password: { type: string, format: password, minLength: 8, example: Dating123 }
   *               verificationCode: { type: string, pattern: '^\\d{6}$', example: '123456' }
   *               birthdate: { type: string, format: date, example: '1996-05-20' }
   *     responses:
   *       201:
   *         description: 帳號建立成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data: { $ref: '#/components/schemas/AuthSession' }
   *       400:
   *         description: 資料或驗證碼無效
   *       409:
   *         description: 帳號已存在
   *       429:
   *         description: 建立帳號次數過多
   */
  router.post(
    '/api/auth/register',
    registrationLimiter,
    validateRequestBody(registerDto, { abortEarly: false }),
    handler.register,
  )
  /**
   * @swagger
   * /api/auth/login:
   *   post:
   *     tags: [Authentication]
   *     summary: 使用 Email 與密碼登入
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [account, password]
   *             properties:
   *               account: { type: string, format: email, example: user@example.com }
   *               password: { type: string, format: password, example: Dating123 }
   *     responses:
   *       200:
   *         description: 登入成功
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data: { $ref: '#/components/schemas/AuthSession' }
   *       401:
   *         description: Email 或密碼錯誤
   *       429:
   *         description: 登入失敗次數過多
   */
  router.post(
    '/api/auth/login',
    loginLimiter,
    validateRequestBody(loginDto, { abortEarly: false }),
    handler.login,
  )
  /**
   * @swagger
   * /api/auth/me:
   *   get:
   *     tags: [Account]
   *     summary: 取得目前登入使用者
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 使用者資料
   *       401:
   *         description: JWT 缺失、無效或已過期
   */
  router.get('/api/auth/me', handler.me)
  return router
}

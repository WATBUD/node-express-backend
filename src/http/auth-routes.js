import express from 'express'
import { validateRequestBody } from '../dto/joi-help.js'
import { birthdateUpdateDto, genderUpdateDto, loginDto, registerDto, verificationRequestDto } from '../dto/auth-request-dto.js'
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
   *             required: [channel, account, email, password, verificationCode, birthdate, gender]
   *             properties:
   *               channel: { type: string, enum: [email], example: email }
   *               account: { type: string, format: email, example: user@example.com }
   *               phone: { type: string, example: '' }
   *               email: { type: string, format: email, example: user@example.com }
   *               password: { type: string, format: password, minLength: 8, example: Dating123 }
   *               verificationCode: { type: string, pattern: '^\\d{6}$', example: '123456' }
   *               birthdate: { type: string, format: date, example: '1996-05-20' }
   *               gender: { type: string, enum: [male, female], example: female }
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
   *         description: 使用者資料，包含註冊生日與性別最後修改時間
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success: { type: boolean, example: true }
   *                 data:
   *                   type: object
   *                   properties:
   *                     id: { type: integer, example: 1 }
   *                     account: { type: string, format: email }
   *                     birthdate: { type: string, format: date, nullable: true }
   *                     gender: { type: string, enum: [male, female] }
   *                     gender_changed_at: { type: string, format: date-time, nullable: true }
   *       401:
   *         description: JWT 缺失、無效或已過期
   */
  router.get('/api/auth/me', handler.me)
  /**
   * @swagger
   * /api/auth/gender:
   *   patch:
   *     tags: [Account]
   *     summary: 修改目前使用者性別（每 30 天限一次）
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [gender]
   *             properties:
   *               gender: { type: string, enum: [male, female], example: male }
   *     responses:
   *       200: { description: 修改成功，或提交的性別與目前相同 }
   *       400: { description: 性別代號無效 }
   *       401: { description: JWT 缺失、無效或已過期 }
   *       429: { description: 距離上次修改尚未滿 30 天 }
   */
  router.patch(
    '/api/auth/gender',
    validateRequestBody(genderUpdateDto, { abortEarly: false }),
    handler.updateGender,
  )
  /**
   * @swagger
   * /api/auth/birthdate:
   *   patch:
   *     tags: [Account]
   *     summary: 修改生日（年齡由生日自動計算）
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [birthdate]
   *             properties:
   *               birthdate: { type: string, format: date, example: '1996-05-20' }
   *     responses:
   *       200: { description: 修改成功 }
   *       400: { description: 日期無效或年齡不在 18 至 120 歲 }
   *       401: { description: JWT 缺失、無效或已過期 }
   */
  router.patch(
    '/api/auth/birthdate',
    validateRequestBody(birthdateUpdateDto, { abortEarly: false }),
    handler.updateBirthdate,
  )
  return router
}

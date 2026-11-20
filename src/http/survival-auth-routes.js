import express from 'express'
import { loginLimiter, registrationLimiter } from '../middlewares/security.js'
import { survivalLoginDto, survivalRegisterDto } from '../dto/survival-auth-request-dto.js'

export const SURVIVAL_AUTH_PREFIX = '/api/survival-equation/auth'

// 驗證失敗回傳統一錯誤格式 { success:false, error:{ code, message } }
const validate = schema => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true })
  if (error) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: error.details.map(d => d.message).join('; ') },
    })
  }
  req.body = value
  next()
}

export default handler => {
  const router = express.Router()
  /**
   * @swagger
   * /auth/register:
   *   post:
   *     tags: [Survival Equation Account]
   *     summary: 建立 Survival Equation 遊戲帳號
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [account, password]
   *             properties:
   *               account: { type: string, pattern: '^[A-Za-z0-9_]{3,32}$', example: survivor_01 }
   *               password: { type: string, format: password, minLength: 8, example: Island2026 }
   *               nickname: { type: string, maxLength: 20, example: 漂流者 }
   *     responses:
   *       201:
   *         description: 帳號建立成功，回傳存取權杖
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/SurvivalAuthSession' }
   *       400: { description: 帳號或密碼格式錯誤 }
   *       409: { description: 帳號已存在 }
   *       429: { description: 建立帳號次數過多 }
   */
  router.post(`${SURVIVAL_AUTH_PREFIX}/register`, registrationLimiter, validate(survivalRegisterDto), handler.register)
  /**
   * @swagger
   * /auth/login:
   *   post:
   *     tags: [Survival Equation Account]
   *     summary: 使用帳號與密碼登入
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [account, password]
   *             properties:
   *               account: { type: string, example: survivor_01 }
   *               password: { type: string, format: password, example: Island2026 }
   *     responses:
   *       200:
   *         description: 登入成功，回傳存取權杖（7 天有效）
   *         content:
   *           application/json:
   *             schema: { $ref: '#/components/schemas/SurvivalAuthSession' }
   *       401: { description: 帳號或密碼錯誤 }
   *       403: { description: 帳號已停權 }
   *       429: { description: 登入失敗次數過多 }
   */
  router.post(`${SURVIVAL_AUTH_PREFIX}/login`, loginLimiter, validate(survivalLoginDto), handler.login)
  /**
   * @swagger
   * /auth/me:
   *   get:
   *     tags: [Survival Equation Account]
   *     summary: 取得目前登入的玩家
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200: { description: 玩家資料 }
   *       401: { description: 權杖缺失、無效、過期，或不是 Survival Equation 權杖 }
   */
  router.get(`${SURVIVAL_AUTH_PREFIX}/me`, handler.me)
  return router
}

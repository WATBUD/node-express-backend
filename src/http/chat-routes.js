import express from 'express'
import { rateLimit } from 'express-rate-limit'

const messageLimiter = rateLimit({
  windowMs: 60 * 1000, limit: 60, standardHeaders: 'draft-8', legacyHeaders: false,
  keyGenerator: req => String(req.user.user_id),
  handler: (_req, res) => res.status(429).json({ success: false, error: { code: 'CHAT_RATE_LIMITED', message: 'CHAT_RATE_LIMITED' } }),
})

export default handler => {
  const router = express.Router()
  /** @swagger
   * /api/chat/threads:
   *   get:
   *     tags: [Chat]
   *     summary: 取得已通過審核的好友聊天室
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200: { description: 聊天室清單 }
   */
  router.get('/threads', handler.threads)
  /** @swagger
   * /api/chat/users/{userId}/messages:
   *   get:
   *     tags: [Chat]
   *     summary: 取得與好友的訊息
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - { in: path, name: userId, required: true, schema: { type: integer } }
   *     responses:
   *       200: { description: 訊息清單 }
   *       403: { description: 尚未成為好友 }
   *   post:
   *     tags: [Chat]
   *     summary: 傳送文字訊息給已通過審核的好友
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - { in: path, name: userId, required: true, schema: { type: integer } }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [text]
   *             properties:
   *               text: { type: string, minLength: 1, maxLength: 1000 }
   *     responses:
   *       201: { description: 訊息已儲存 }
   *       403: { description: 尚未成為好友 }
   */
  router.get('/users/:userId/messages', handler.messages)
  router.post('/users/:userId/messages', messageLimiter, handler.send)
  return router
}

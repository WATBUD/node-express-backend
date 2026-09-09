import express from 'express'
import multer from 'multer'
import { rateLimit } from 'express-rate-limit'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: 3 * 1024 * 1024, fields: 4 },
})
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: req => String(req.user.user_id),
  handler: (_req, res) => res.status(429).json({ success: false, error: { code: 'VOICE_UPLOAD_RATE_LIMITED', message: 'VOICE_UPLOAD_RATE_LIMITED' } }),
})

export default handler => {
  const router = express.Router()
  /** @swagger
   * /api/voice/profile:
   *   put:
   *     tags: [Voice invitations]
   *     summary: 新增或更換自己的 10 至 60 秒公開自介語音
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required: [audio]
   *             properties:
   *               audio: { type: string, format: binary }
   *     responses:
   *       200: { description: 自介語音已儲存 }
   */
  router.put('/profile', uploadLimiter, upload.single('audio'), handler.saveProfileVoice)
  /** @swagger
   * /api/voice/profiles/{userId}/audio:
   *   get:
   *     tags: [Voice invitations]
   *     summary: 播放指定使用者的公開自介語音
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - { in: path, name: userId, required: true, schema: { type: integer } }
   *     responses:
   *       200: { description: 自介語音串流 }
   *       404: { description: 尚未設定自介語音 }
   */
  router.get('/profiles/:userId/audio', handler.profileAudio)
  /**
   * @swagger
   * /api/voice/discovery:
   *   get:
   *     tags: [Voice invitations]
   *     summary: 取得尚未送出待審語音的探索對象
   *     security: [{ bearerAuth: [] }]
   *     responses:
   *       200: { description: 探索對象清單 }
   */
  router.get('/discovery', handler.discover)
  /**
   * @swagger
   * /api/voice/invites:
   *   get:
   *     tags: [Voice invitations]
   *     summary: 取得語音收件匣或已送出清單
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - { in: query, name: box, schema: { type: string, enum: [inbox, sent] } }
   *     responses:
   *       200:
   *         description: 語音邀請清單
   *   post:
   *     tags: [Voice invitations]
   *     summary: 送出 10 至 60 秒語音邀請
   *     security: [{ bearerAuth: [] }]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required: [recipientUserId, audio]
   *             properties:
   *               recipientUserId: { type: integer }
   *               audio: { type: string, format: binary }
   *     responses:
   *       201: { description: 已送出並等待收件人審核 }
   *       400: { description: 音訊格式、長度或收件人無效 }
   *       413: { description: 檔案超過 3 MB }
   */
  router.get('/invites', handler.list)
  router.post('/invites', uploadLimiter, upload.single('audio'), handler.send)
  /**
   * @swagger
   * /api/voice/invites/{id}/audio:
   *   get:
   *     tags: [Voice invitations]
   *     summary: 串流語音（僅寄件人與收件人）
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200: { description: 原始音訊串流 }
   *       404: { description: 不存在或無權存取 }
   */
  router.get('/invites/:id/audio', handler.audio)
  /**
   * @swagger
   * /api/voice/invites/{id}:
   *   delete:
   *     tags: [Voice invitations]
   *     summary: 寄件人撤回待審邀請並刪除音訊
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     responses:
   *       200: { description: 已撤回 }
   */
  router.delete('/invites/:id', handler.cancel)
  /**
   * @swagger
   * /api/voice/invites/{id}/review:
   *   post:
   *     tags: [Voice invitations]
   *     summary: 收件人通過或拒絕語音邀請
   *     security: [{ bearerAuth: [] }]
   *     parameters:
   *       - { in: path, name: id, required: true, schema: { type: integer } }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [decision]
   *             properties:
   *               decision: { type: string, enum: [approved, rejected] }
   *     responses:
   *       200: { description: 審核完成 }
   */
  router.post('/invites/:id/review', handler.review)
  return router
}

import express from 'express'

const sendError = (res, error) => res.status(error.statusCode || 500).json({ success: false, error: { code: error.code || 'INTERNAL_ERROR', message: error.code || 'INTERNAL_ERROR' } })

export default service => {
  const router = express.Router()
  router.put('/devices', async (req, res) => { try { res.json({ success: true, data: await service.register(req.user.user_id, req.body) }) } catch (error) { sendError(res, error) } })
  router.delete('/devices', async (req, res) => { try { res.json({ success: true, data: await service.remove(req.user.user_id, req.body) }) } catch (error) { sendError(res, error) } })
  return router
}

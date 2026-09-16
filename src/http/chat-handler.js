const sendError = (res, error) => res.status(error.statusCode || 500).json({ success: false, error: { code: error.code || 'INTERNAL_ERROR', message: error.code || 'INTERNAL_ERROR' } })

export default service => ({
  threads: async (req, res) => { try { res.json({ success: true, data: await service.threads(req.user.user_id) }) } catch (e) { sendError(res, e) } },
  messages: async (req, res) => { try { res.set('Cache-Control', 'no-store'); res.json({ success: true, data: await service.messages(req.user.user_id, req.params.userId, req.query.afterId) }) } catch (e) { sendError(res, e) } },
  send: async (req, res) => { try { res.status(201).json({ success: true, data: await service.send(req.user.user_id, req.params.userId, req.body) }) } catch (e) { sendError(res, e) } },
})

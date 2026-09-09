const sendError = (res, error) => res.status(error.statusCode || 500).json({
  success: false,
  error: { code: error.code || 'INTERNAL_ERROR', message: error.code || 'INTERNAL_ERROR' },
})

export default service => ({
  discover: async (req, res) => { try { res.json({ success: true, data: await service.discover(req.user.user_id) }) } catch (e) { sendError(res, e) } },
  saveProfileVoice: async (req, res) => { try { res.json({ success: true, data: await service.saveProfileVoice(req.user.user_id, req.file) }) } catch (e) { sendError(res, e) } },
  profileAudio: async (req, res) => {
    try {
      const item = await service.profileAudio(req.params.userId)
      res.set({ 'Content-Type': item.mime_type, 'Content-Length': String(item.byte_size), 'Cache-Control': 'private, max-age=300' })
      res.send(item.audio_data)
    } catch (e) { sendError(res, e) }
  },
  send: async (req, res) => { try { res.status(201).json({ success: true, data: await service.send(req.user.user_id, req.body.recipientUserId, req.file) }) } catch (e) { sendError(res, e) } },
  list: async (req, res) => { try { res.json({ success: true, data: await service.list(req.user.user_id, req.query.box || 'inbox') }) } catch (e) { sendError(res, e) } },
  audio: async (req, res) => {
    try {
      const item = await service.audio(req.params.id, req.user.user_id)
      res.set({ 'Content-Type': item.mime_type, 'Content-Length': String(item.byte_size), 'Cache-Control': 'private, no-store', 'Accept-Ranges': 'none' })
      res.send(item.audio_data)
    } catch (e) { sendError(res, e) }
  },
  cancel: async (req, res) => { try { res.json({ success: true, data: await service.cancel(req.params.id, req.user.user_id) }) } catch (e) { sendError(res, e) } },
  review: async (req, res) => { try { res.json({ success: true, data: await service.review(req.params.id, req.user.user_id, req.body.decision) }) } catch (e) { sendError(res, e) } },
})

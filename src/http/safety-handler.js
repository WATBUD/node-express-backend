const sendError = (res, error) => res.status(error.statusCode || 500).json({
  success: false,
  error: { code: error.code || 'INTERNAL_ERROR', message: error.code || 'INTERNAL_ERROR' },
})

export default service => ({
  createReport: async (req, res) => {
    try {
      const data = await service.createReport(req.user.user_id, req.body)
      return res.status(201).json({ success: true, data })
    } catch (error) {
      return sendError(res, error)
    }
  },
})

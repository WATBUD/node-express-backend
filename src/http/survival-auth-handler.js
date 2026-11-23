import { SurvivalAuthError } from '../services/survival-auth-service.js'

const fail = (res, error) => {
  if (error instanceof SurvivalAuthError) {
    return res.status(error.status).json({ success: false, error: { code: error.code, message: error.message } })
  }
  console.error('[survival-equation auth]', error)
  return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } })
}

export default service => ({
  register: async (req, res) => {
    try {
      res.status(201).json({ success: true, data: await service.register(req.body) })
    } catch (error) {
      fail(res, error)
    }
  },
  login: async (req, res) => {
    try {
      res.json({ success: true, data: await service.login(req.body) })
    } catch (error) {
      fail(res, error)
    }
  },
  me: async (req, res) => {
    try {
      res.json({ success: true, data: await service.me(req.user) })
    } catch (error) {
      fail(res, error)
    }
  },
})

import { localizedError } from './auth-messages.js'
const sendError = (req, res, error) => res.status(error.statusCode || 500).json({ success: false, error: { code: error.code || 'INTERNAL_ERROR', message: localizedError(req,error) } })

export default service => ({
  requestVerification: async (req, res) => { try { res.json({ success: true, data: await service.requestCode(req.body) }) } catch (e) { sendError(req,res,e) } },
  register: async (req, res) => { try { res.status(201).json({ success: true, data: await service.register(req.body) }) } catch (e) { sendError(req,res,e) } },
  login: async (req, res) => { try { res.json({ success: true, data: await service.login(req.body) }) } catch (e) { sendError(req,res,e) } },
  me: async (req, res) => { try { res.json({ success: true, data: await service.me(req.user.user_id) }) } catch (e) { sendError(req,res,e) } },
})

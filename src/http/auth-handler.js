import { publicErrorMessage } from './auth-messages.js'
const sendError = (_req, res, error) => res.status(error.statusCode || 500).json({ success: false, error: { code: error.code || 'INTERNAL_ERROR', message: publicErrorMessage(error) } })

export default service => ({
  requestVerification: async (req, res) => { try { res.json({ success: true, data: await service.requestCode(req.body) }) } catch (e) { sendError(req,res,e) } },
  register: async (req, res) => { try { res.status(201).json({ success: true, data: await service.register(req.body) }) } catch (e) { sendError(req,res,e) } },
  login: async (req, res) => { try { res.json({ success: true, data: await service.login(req.body) }) } catch (e) { sendError(req,res,e) } },
  me: async (req, res) => { try { res.json({ success: true, data: await service.me(req.user.user_id) }) } catch (e) { sendError(req,res,e) } },
  updateGender: async (req, res) => { try { res.json({ success: true, data: await service.updateGender(req.user.user_id, req.body) }) } catch (e) { sendError(req,res,e) } },
  updateBirthdate: async (req, res) => { try { res.json({ success: true, data: await service.updateBirthdate(req.user.user_id, req.body) }) } catch (e) { sendError(req,res,e) } },
})

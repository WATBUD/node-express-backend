import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

const roomFor = userId => `user:${Number(userId)}`
const socketError = error => ({
  code: error?.code || 'INTERNAL_ERROR',
  message: error?.code || 'INTERNAL_ERROR',
})

export const configureChatSocket = (httpServer, {
  allowedOrigins,
  chatService,
  userRepository,
  onOfflineMessage = async () => {},
} = {}) => {
  const io = new Server(httpServer, {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
    pingInterval: 25000,
    pingTimeout: 20000,
  })

  const verifySession = async token => {
    if (!token || !process.env.JWT_SECRET) throw Object.assign(new Error('UNAUTHORIZED'), { code: 'UNAUTHORIZED' })
    const claims = jwt.verify(token, process.env.JWT_SECRET)
    const user = await userRepository.getUserById(claims.user_id)
    if (!user || user.is_banned || Number(user.auth_token_version || 0) !== Number(claims.auth_token_version || 0)) {
      throw Object.assign(new Error('SESSION_REVOKED'), { code: 'SESSION_REVOKED' })
    }
    return Number(claims.user_id)
  }

  io.use(async (socket, next) => {
    try {
      socket.data.userId = await verifySession(socket.handshake.auth?.token)
      next()
    } catch (error) {
      const code = error.code === 'SESSION_REVOKED' ? 'SESSION_REVOKED' : 'UNAUTHORIZED'
      next(Object.assign(new Error(code), { data: { code, message: code } }))
    }
  })

  io.on('connection', socket => {
    const userId = socket.data.userId
    socket.join(roomFor(userId))
    let sentInWindow = 0
    let windowStartedAt = Date.now()

    const sessionTimer = setInterval(async () => {
      try { await verifySession(socket.handshake.auth?.token) }
      catch { socket.disconnect(true) }
    }, 60000)

    socket.on('message:send', async (payload, acknowledge = () => {}) => {
      try {
        if (Date.now() - windowStartedAt >= 60000) {
          windowStartedAt = Date.now()
          sentInWindow = 0
        }
        if (++sentInWindow > 60) throw Object.assign(new Error('RATE_LIMITED'), { code: 'RATE_LIMITED', statusCode: 429 })
        const recipientUserId = Number(payload?.recipientUserId)
        if (!Number.isSafeInteger(recipientUserId) || recipientUserId <= 0) throw Object.assign(new Error('INVALID_RECIPIENT'), { code: 'INVALID_RECIPIENT', statusCode: 400 })

        const message = await chatService.send(userId, recipientUserId, payload)
        io.to(roomFor(userId)).emit('message:new', { peerUserId: recipientUserId, message: { ...message, mine: true } })
        io.to(roomFor(recipientUserId)).emit('message:new', { peerUserId: userId, message: { ...message, mine: false } })
        acknowledge({ ok: true, message })

        const sockets = await io.in(roomFor(recipientUserId)).fetchSockets()
        if (sockets.length === 0) void onOfflineMessage({ recipientUserId, senderUserId: userId, message }).catch(console.error)
      } catch (error) {
        acknowledge({ ok: false, error: socketError(error) })
      }
    })

    socket.on('disconnect', () => clearInterval(sessionTimer))
  })

  return io
}

const fail = (code, statusCode) => Object.assign(new Error(code), { code, statusCode })

const publicMessage = (row, currentUserId) => ({
  id: String(row.id),
  mine: Number(row.sender_user_id) === Number(currentUserId),
  text: row.body,
  createdAt: row.created_at,
  ...(row.client_message_id ? { clientMessageId: row.client_message_id } : {}),
})

export default class ChatService {
  constructor(repository) { this.repository = repository }

  async threads(userId) {
    return (await this.repository.threads(userId)).map(row => ({
      id: String(row.connection_id), source: row.source,
      lastMessage: row.last_message || '', updatedAt: row.last_message_at || row.created_at,
      user: { id: Number(row.user_id), name: row.name, image: row.image, gender: row.gender, headline: row.headline || '' },
    }))
  }

  async messages(userId, peerUserId, afterId) {
    let cursor
    if (afterId !== undefined) {
      cursor = Number(afterId)
      if (!/^\d+$/.test(String(afterId)) || !Number.isSafeInteger(cursor) || cursor < 0) throw fail('INVALID_CHAT_CURSOR', 400)
    }
    const connection = await this.repository.connection(userId, peerUserId)
    if (!connection) throw fail('CHAT_CONNECTION_REQUIRED', 403)
    return (await this.repository.messages(connection.id, 100, cursor)).map(row => publicMessage(row, userId))
  }

  async send(userId, peerUserId, input) {
    const body = (typeof input === 'string' ? input : input?.text || '').trim()
    const clientMessageId = typeof input === 'object' ? input?.clientMessageId : undefined
    if (!body || Array.from(body).length > 1000) throw fail('INVALID_CHAT_MESSAGE', 400)
    if (clientMessageId !== undefined && !/^[A-Za-z0-9._:-]{8,64}$/.test(clientMessageId)) throw fail('INVALID_CLIENT_MESSAGE_ID', 400)
    const connection = await this.repository.connection(userId, peerUserId)
    if (!connection) throw fail('CHAT_CONNECTION_REQUIRED', 403)
    return publicMessage(await this.repository.send(connection.id, userId, body, clientMessageId), userId)
  }
}

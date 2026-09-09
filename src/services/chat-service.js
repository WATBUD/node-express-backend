const fail = (code, statusCode) => Object.assign(new Error(code), { code, statusCode })

const publicMessage = (row, currentUserId) => ({
  id: String(row.id),
  mine: Number(row.sender_user_id) === Number(currentUserId),
  text: row.body,
  createdAt: row.created_at,
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

  async messages(userId, peerUserId) {
    const connection = await this.repository.connection(userId, peerUserId)
    if (!connection) throw fail('CHAT_CONNECTION_REQUIRED', 403)
    return (await this.repository.messages(connection.id)).map(row => publicMessage(row, userId))
  }

  async send(userId, peerUserId, input) {
    const body = typeof input === 'string' ? input.trim() : ''
    if (!body || Array.from(body).length > 1000) throw fail('INVALID_CHAT_MESSAGE', 400)
    const connection = await this.repository.connection(userId, peerUserId)
    if (!connection) throw fail('CHAT_CONNECTION_REQUIRED', 403)
    return publicMessage(await this.repository.send(connection.id, userId, body), userId)
  }
}

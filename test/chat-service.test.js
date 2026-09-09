import { expect } from 'chai'
import ChatService from '../src/services/chat-service.js'

describe('ChatService', () => {
  it('requires an approved connection before reading or sending messages', async () => {
    const service = new ChatService({ connection: async () => null })
    for (const action of [() => service.messages(1, 2), () => service.send(1, 2, 'hello')]) {
      try { await action(); throw new Error('expected rejection') }
      catch (error) { expect(error.code).to.equal('CHAT_CONNECTION_REQUIRED') }
    }
  })

  it('trims and stores a message for connected users', async () => {
    const stored = []
    const service = new ChatService({
      connection: async () => ({ id: 9 }),
      send: async (connectionId, senderId, body) => {
        stored.push({ connectionId, senderId, body })
        return { id: 4n, sender_user_id: senderId, body, created_at: new Date('2026-09-08T00:00:00Z') }
      },
    })
    const result = await service.send(1, 2, '  hello  ')
    expect(stored).to.deep.equal([{ connectionId: 9, senderId: 1, body: 'hello' }])
    expect(result).to.include({ id: '4', mine: true, text: 'hello' })
  })
})

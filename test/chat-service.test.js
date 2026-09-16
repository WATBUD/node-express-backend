import { expect } from 'chai'
import ChatService from '../src/services/chat-service.js'

describe('ChatService', () => {
  it('validates and forwards incremental cursors without bypassing authorization', async () => {
    const calls=[]
    const service=new ChatService({connection:async()=>({id:9}),messages:async(...args)=>{calls.push(args);return []}})
    await service.messages(1,2,'42')
    expect(calls).to.deep.equal([[9,100,42]])
    for(const cursor of ['-1','1x','1.5','9007199254740992']) {
      try {await service.messages(1,2,cursor);throw new Error('expected rejection')}
      catch(error){expect(error.code).to.equal('INVALID_CHAT_CURSOR')}
    }
  })
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

  it('preserves a validated client id so Socket and HTTP retries are idempotent', async () => {
    const calls = []
    const service = new ChatService({
      connection: async () => ({ id: 9 }),
      send: async (...args) => {
        calls.push(args)
        return { id: 5n, sender_user_id: 1, body: 'hello', client_message_id: args[3], created_at: new Date() }
      },
    })
    const result = await service.send(1, 2, { text: ' hello ', clientMessageId: 'client-msg-123' })
    expect(calls).to.deep.equal([[9, 1, 'hello', 'client-msg-123']])
    expect(result.clientMessageId).to.equal('client-msg-123')
  })

  it('publishes newly stored messages but not idempotent retries', async () => {
    let created = true
    const service = new ChatService({
      connection: async () => ({ id: 9 }),
      send: async (_connectionId, senderId, body, clientMessageId) => ({
        id: 6n, sender_user_id: senderId, body, client_message_id: clientMessageId,
        created_at: new Date(), _created: created,
      }),
    })
    const events = []
    service.onMessageSent(event => events.push(event))
    await service.send(1, 2, { text: 'hello', clientMessageId: 'client-msg-456' })
    created = false
    await service.send(1, 2, { text: 'hello', clientMessageId: 'client-msg-456' })
    expect(events).to.have.length(1)
    expect(events[0]).to.include({ senderUserId: 1, recipientUserId: 2 })
  })
})

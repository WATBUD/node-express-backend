import { expect } from 'chai'
import PushService from '../src/services/push-service.js'

const credentials = JSON.stringify({
  client_email: 'push@example.com',
  private_key: 'unused-in-test',
  project_id: 'test-project',
})

const createService = ({ displayName = '小美' } = {}) => {
  const requests = []
  const repository = {
    tokens: async () => [{ token: 'device-token' }],
    displayName: async () => displayName,
    removeToken: async () => {},
  }
  const service = new PushService(repository, async (url, options) => {
    requests.push({ url, options })
    return { ok: true, status: 200, json: async () => ({}) }
  })
  service.cachedAccessToken = { value: 'access-token', expiresAt: Date.now() + 120000 }
  return { service, requests }
}

describe('PushService', () => {
  let previousCredentials
  let previousProjectId

  beforeEach(() => {
    previousCredentials = process.env.FCM_SERVICE_ACCOUNT_JSON
    previousProjectId = process.env.FCM_PROJECT_ID
    process.env.FCM_SERVICE_ACCOUNT_JSON = credentials
    process.env.FCM_PROJECT_ID = 'test-project'
  })

  afterEach(() => {
    if (previousCredentials === undefined) delete process.env.FCM_SERVICE_ACCOUNT_JSON
    else process.env.FCM_SERVICE_ACCOUNT_JSON = previousCredentials
    if (previousProjectId === undefined) delete process.env.FCM_PROJECT_ID
    else process.env.FCM_PROJECT_ID = previousProjectId
  })

  it('identifies the sender in an offline chat notification', async () => {
    const { service, requests } = createService()

    await service.sendNewMessage({ recipientUserId: 2, senderUserId: 1 })

    const payload = JSON.parse(requests[0].options.body)
    expect(payload.message.notification).to.deep.equal({
      title: '小美 傳來新訊息',
      body: '你有一則新訊息',
    })
    expect(payload.message.data.senderUserId).to.equal('1')
  })

  it('uses the brand title when the sender has no display name', async () => {
    const { service, requests } = createService({ displayName: '  ' })

    await service.sendNewMessage({ recipientUserId: 2, senderUserId: 1 })

    const payload = JSON.parse(requests[0].options.body)
    expect(payload.message.notification.title).to.equal('INI Dating')
  })
})

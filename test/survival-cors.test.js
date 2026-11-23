import { expect } from 'chai'
import express from 'express'
import cors from 'cors'
import { buildCorsOptions } from '../src/config/cors-config.js'

describe('Survival browser CORS', () => {
  it('permits the production game origin and preserves custom origins', () => {
    const options = buildCorsOptions(' https://custom.example,https://custom.example ')
    expect(options.origin).to.include('https://survival-equation-web.vercel.app')
    expect(options.origin.filter(value => value === 'https://custom.example')).to.have.length(1)
  })

  it('allows JSON login preflight only for an allowed origin', async () => {
    const app = express()
    app.use(cors(buildCorsOptions('')))
    const server = app.listen(0, '127.0.0.1')
    await new Promise(resolve => server.once('listening', resolve))
    try {
      for (const origin of ['https://survival-equation-web.vercel.app', 'https://untrusted.example']) {
        const response = await fetch(`http://127.0.0.1:${server.address().port}/api/survival-equation/auth/login`, {
          method: 'OPTIONS', headers: { Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' },
        })
        expect(response.status).to.equal(204)
        expect(response.headers.get('access-control-allow-origin')).to.equal(origin.includes('untrusted') ? null : origin)
      }
    } finally {
      await new Promise(resolve => server.close(resolve))
    }
  })
})

import { expect } from 'chai'
import AuthService from '../src/services/auth-service.js'

class MemoryUsers {
  constructor() { this.users=[] }
  async findUserByLogin(account) { const value=account.toLowerCase();return this.users.find(x=>[x.user_account,x.email,x.phone].filter(Boolean).includes(value))||null }
  async createUser(data) { const user={...data,user_id:this.users.length+1,created_at:new Date(),is_banned:false};this.users.push(user);return user }
  async getUserById(id) { return this.users.find(x=>x.user_id===Number(id))||null }
}

describe('AuthService',()=>{
  before(()=>{process.env.JWT_SECRET='test-secret-that-is-long-enough'})
  it('registers with a backend verification code and then logs in',async()=>{
    const service=new AuthService(new MemoryUsers())
    const verification=await service.requestCode({channel:'email',destination:'hello@example.com'})
    expect(verification.developmentCode).to.match(/^\d{6}$/)
    const registered=await service.register({channel:'email',account:'hello@example.com',email:'hello@example.com',phone:'',password:'Password123',verificationCode:verification.developmentCode,birthdate:'1996-05-20'})
    expect(registered.user.account).to.equal('hello@example.com')
    expect(registered.accessToken).to.be.a('string')
    const loggedIn=await service.login({account:'hello@example.com',password:'Password123'})
    expect(loggedIn.user.id).to.equal(registered.user.id)
  })

  it('rejects an incorrect password',async()=>{
    const service=new AuthService(new MemoryUsers())
    const verification=await service.requestCode({channel:'phone',destination:'0912345678'})
    await service.register({channel:'phone',account:'0912345678',email:'',phone:'0912345678',password:'Password123',verificationCode:verification.developmentCode,birthdate:'1996-05-20'})
    try { await service.login({account:'0912345678',password:'wrong'});throw new Error('expected rejection') } catch(error) { expect(error.code).to.equal('INVALID_CREDENTIALS') }
  })
})

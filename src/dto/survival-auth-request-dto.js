import Joi from 'joi'

// 帳號：3～32 字元英數與底線（不分大小寫）
const account = Joi.string().trim().pattern(/^[A-Za-z0-9_]{3,32}$/).required()
  .messages({ 'string.pattern.base': 'account must be 3-32 letters, numbers or underscores' })

// 密碼：8～100 字元，至少含一個英文字母與一個數字（與既有帳號規則一致）
const password = Joi.string().min(8).max(100).pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/).required()
  .messages({ 'string.pattern.base': 'password must contain at least one letter and one number' })

export const survivalRegisterDto = Joi.object({
  account,
  password,
  nickname: Joi.string().trim().min(1).max(20).allow(''),
})

export const survivalLoginDto = Joi.object({
  account: Joi.string().trim().min(3).max(32).required(),
  password: Joi.string().max(100).required(),
})

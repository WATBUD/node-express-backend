import Joi from 'joi'

const password = Joi.string().min(8).max(100).pattern(/^(?=.*[A-Za-z])(?=.*\d).+$/).required()

export const loginDto = Joi.object({
  account: Joi.string().trim().min(3).max(100).required(),
  password: Joi.string().required(),
})

export const verificationRequestDto = Joi.object({
  channel: Joi.string().valid('phone', 'email').required(),
  destination: Joi.alternatives().conditional('channel', {
    is: 'email', then: Joi.string().email().required(),
    otherwise: Joi.string().pattern(/^09\d{8}$/).required(),
  }),
})

export const registerDto = Joi.object({
  channel: Joi.string().valid('phone', 'email').required(),
  account: Joi.string().trim().min(3).max(100).required(),
  phone: Joi.string().allow('').pattern(/^09\d{8}$/),
  email: Joi.string().allow('').email(),
  password,
  verificationCode: Joi.string().pattern(/^\d{6}$/).required(),
  birthdate: Joi.date().iso().max('now').required(),
  gender: Joi.string().valid('male', 'female').required(),
})

export const genderUpdateDto = Joi.object({
  gender: Joi.string().valid('male', 'female').required(),
})

export const birthdateUpdateDto = Joi.object({
  birthdate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
})

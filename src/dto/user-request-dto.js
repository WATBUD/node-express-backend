import Joi from 'joi';

export const dtoUserCredentials = Joi.object({
  user_account: Joi.string().required().messages({
    'string.base': 'user_account should be a string',
    'any.required': 'user_account is required',
  }),
  password: Joi.string().required().messages({
    'string.base': 'password should be a string',
    'any.required': 'password is required',
  }),
});

export const dtoUserRegister = Joi.object({
  user_account: Joi.string().min(3).max(100).required().messages({
    'string.base': 'user_account should be a string',
    'string.min': 'user_account must be at least 3 characters',
    'string.max': 'user_account must be at most 100 characters',
    'any.required': 'user_account is required',
  }),
  username: Joi.string().min(1).max(50).required().messages({
    'string.base': 'username should be a string',
    'string.max': 'username must be at most 50 characters',
    'any.required': 'username is required',
  }),
  email: Joi.string().email().max(100).required().messages({
    'string.base': 'email should be a string',
    'string.email': 'email must be a valid email address',
    'string.max': 'email must be at most 100 characters',
    'any.required': 'email is required',
  }),
  password: Joi.string().min(6).max(100).required().messages({
    'string.base': 'password should be a string',
    'string.min': 'password must be at least 6 characters',
    'string.max': 'password must be at most 100 characters',
    'any.required': 'password is required',
  }),
});

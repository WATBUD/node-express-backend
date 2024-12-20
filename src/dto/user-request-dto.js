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

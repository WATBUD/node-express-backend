import Joi from 'joi';
export const validateCreateTrackingStockRequest = Joi.object({
  stock_id: Joi.string().required().messages({
    'string.base': 'stock_id should be a string',
    'any.required': 'stock_id is required',
  }),
  note: Joi.string().required().messages({
    'string.base': 'note should be a string',
    'any.required': 'note is required',
  }),
  is_blocked: Joi.boolean().required().messages({
    'boolean.base': 'is_blocked should be a boolean',
    'any.required': 'is_blocked is required',
  }),
});

export const validateTrackingStockRequest = Joi.object({
  note: Joi.string().required().messages({
    'string.base': 'note should be a string',
    'any.required': 'note is required',
  }),
  is_blocked: Joi.boolean().required().messages({
    'boolean.base': 'is_blocked should be a boolean',
    'any.required': 'is_blocked is required',
  }),
});
  
import Joi from 'joi';
// class dtoTrackingStockRequest {
//     constructor(id, stockId, userId, note = '', isBlocked = false, updatedAt = new Date()) {
//       this.id = id;
//       this.stockId = stockId;
//       this.userId = userId;
//       this.note = note;
//       this.isBlocked = isBlocked;
//       this.updatedAt = updatedAt;
//     }
//   }
export const dtoTrackingStockRequest = Joi.object({
  // userID: Joi.string().required().messages({
  //   'string.base': 'userID should be a string',
  //   'any.required': 'userID is required',
  // }),
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
  
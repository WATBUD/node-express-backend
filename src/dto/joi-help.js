//import Joi from 'joi';

export const validateRequestBody = (schema, options = {}) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, options);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  };
};

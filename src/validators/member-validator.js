import Joi from 'joi';

export const memberValidationSchema = Joi.object({
    name: Joi.string().trim().allow('').default(''),
    email: Joi.string().trim().email().allow('').default(''),
    position: Joi.string().trim().allow('').default(''),
    department: Joi.string().trim().allow('').default(''),
    experience: Joi.number().min(2).allow(null).default(null),
    isLoginAccess: Joi.boolean().default(false)
});


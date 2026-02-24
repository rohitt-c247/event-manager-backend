import Joi from 'joi';

export const memberCreateValidationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().trim().email().required(),
    position: Joi.string().trim().required(),
    department: Joi.string().trim().required(),
    experience: Joi.number().min(0).allow(null).default(0),
    isLoginAccess: Joi.boolean().default(false),
    rating: Joi.number().min(0).allow(null).default(0),

});

export const memberUpdateValidationSchema = Joi.object({
    name: Joi.string().trim().allow('').default(''),
    email: Joi.string().trim().email().allow('').default(''),
    position: Joi.string().trim().allow('').default(''),
    department: Joi.string().trim().allow('').default(''),
    experience: Joi.number().min(0).allow(null).default(null),
    isLoginAccess: Joi.boolean().default(false),
    rating: Joi.number().min(0).allow(null).default(0),
});

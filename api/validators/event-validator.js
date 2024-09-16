import Joi from 'joi';

export const eventCreateValidationSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(null || "").optional(),
    date: Joi.date().required(),
    numberOfGroup: Joi.number().min(1).allow(null).default(1)
});

export const eventUpdateValidationSchema = Joi.object({
    name: Joi.string().optional(),
    description: Joi.string().trim().optional(),
    date: Joi.date().optional(),
    numberOfGroup: Joi.number().allow(null).optional()
})
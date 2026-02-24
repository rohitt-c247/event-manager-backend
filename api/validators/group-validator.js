import Joi from 'joi';

export const groupUpdateValidationSchema = Joi.object({
    name: Joi.string().optional(),
})
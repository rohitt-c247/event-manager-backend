import Joi from 'joi';

export const paramsValidationSchema = Joi.object({
    id: Joi.string().required(),
});
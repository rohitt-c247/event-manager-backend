import Joi from 'joi';

export const departmentCreateValidationSchema = Joi.object({
    name: Joi.string().required(),
    createdBy: Joi.string().optional(),
})

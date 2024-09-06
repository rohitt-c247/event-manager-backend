import { body } from 'express-validator';
import { memberModel } from '../models/index.js';

const addMemberValidation = [
    body('name').notEmpty().withMessage('Member name is required'),
    body('position').notEmpty().withMessage('Member position is required'),
    body('department').notEmpty().withMessage('Member department is required'),
    body('experience').notEmpty().withMessage('Member experience is required'),
    body('email')
        .not()
        .isEmpty()
        .withMessage('Member email is required')
        .trim()
        .isEmail()
        .withMessage('Please enter valid email address')
        .trim()
        .custom(async (value, { req }) => {
            const userId = req.params.id;
            const user = await memberModel.findOne({ _id: userId });
            if (value != null && value != user.email) {
                if (await memberModel.findOne({ email: value }) != null) {
                    throw new Error('Email is already exist');
                }
            }
        }),
];

export default {
    addMemberValidation,
}
import { body } from 'express-validator';

const addEventValidation = [
    body('name').notEmpty().withMessage('Event name is required'),
    body('description').notEmpty().withMessage('Event description is required'),
    body('date').notEmpty().withMessage('Event date is required'),
    body('numberOfGroup').notEmpty().withMessage('Event numberOfGroup is required'),
];

export default {
    addEventValidation,
}
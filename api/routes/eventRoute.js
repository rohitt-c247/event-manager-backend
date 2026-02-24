import express from "express";
import eventController from "../controllers/eventController.js";
import { joiParamValidate, joiValidate } from "../middlewares/joiValidate.js";
import { eventCreateValidationSchema, eventUpdateValidationSchema } from "../validators/event-validator.js";
import { paramsValidationSchema } from "../validators/base-validator.js";

const router = express.Router();

router.post('/', joiValidate(eventCreateValidationSchema), eventController.createEvent);
router.get('/', eventController.listOfAnEvent);
router.get('/:id', eventController.getEventById);
router.delete('/:id', joiParamValidate(paramsValidationSchema), eventController.deleteAnEvent);
router.put('/:id', joiValidate(eventUpdateValidationSchema), eventController.updateAnEvent);
router.post('/send-email', eventController.postEmailsToMembers)

export default router
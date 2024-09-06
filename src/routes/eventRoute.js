import express from "express";
import eventController from "../controllers/eventController.js";
import handleValidationErrors from "../middlewares/handleValidation.js";
import eventValidator from "../validators/eventValidator.js";

const router = express.Router();

router.post('/', eventValidator.addEventValidation, handleValidationErrors, eventController.createEvent);
router.get('/', eventController.listOfAnEvent);
router.get('/:id', eventController.getEventById);
router.delete('/:id', eventController.deleteAnEvent);
router.put('/:id', eventValidator.addEventValidation, handleValidationErrors, eventController.updateAnEvent);

export default router
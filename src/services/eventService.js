import { messageConstant, statusCodeConstant } from "../common/constant.js";
import { errorHandler } from "../common/errorHandler.js";
import { messages } from "../common/messages.js";
import { eventModel } from "../models/index.js";

/**
 * This api is use for to create an event
 * @param {*} eventBody 
 * @returns 
 */
const createEvent = async (eventBody) => {
    try {
        const { name, description, date, numberOfGroup } = eventBody
        await eventModel.create({
            name,
            description,
            date,
            numberOfGroup
        })
        return {
            message: messages.itemAddedSuccess.replace("Item", messageConstant.EVENT),
            status: statusCodeConstant.CREATED
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
};

export default {
    createEvent
}
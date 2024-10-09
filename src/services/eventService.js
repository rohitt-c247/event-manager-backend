import { messageConstant, statusCodeConstant } from "../common/constant.js";
import { errorHandler } from "../common/errorHandler.js";
import { messages } from "../common/messages.js";
import { getPagination, getPagingData } from "../helpers/paginationHelper.js";
import { eventModel } from "../models/index.js";
import { emailServiceV1 } from "./emailService.js";
import { getGroupList, saveGroups } from "./groupService.js";

/**
 * This api is use for to create an event
 * @param {*} eventBody 
 * @returns 
 */
const createEvent = async (eventBody) => {
    try {
        const { name, description, date, numberOfGroup } = eventBody
        const eventDoc = await eventModel.create({
            name,
            description,
            date,
            numberOfGroup
        });
        eventBody.eventId = eventDoc._id;
        /** create groups based on number of group count */
        await saveGroups(eventBody)

        return {
            message: messages.itemAddedSuccess.replace("Item", messageConstant.EVENT),
            status: statusCodeConstant.CREATED
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
};
/**
 * THis api use for to get the list of an event
 * @returns 
 */
const listOfAnEvent = async (_limit, _page, search, searchByDate) => {
    try {
        const { limit, offset } = getPagination(_page, _limit);
        /**
         * Manage sorting and pagination
         */
        let sort = { createdAt: -1 };
        const filter = {};
        if (search) {
            filter["name"] = { $regex: search, $options: "i" };
        }
        if (searchByDate) {
            // filter["date"]={ $eq: new Date(searchByDate)}
            const startOfDay = new Date(new Date(searchByDate).setUTCHours(0, 0, 0, 0)); // Start of the day (00:00:00)
            const endOfDay = new Date(new Date(searchByDate).setUTCHours(23, 59, 59, 999)); // End of the day (23:59:59)

            filter["date"] = {
                $gte: startOfDay, // Greater than or equal to the start of the day
                $lte: endOfDay // Less than or equal to the end of the day
            };
        }

        const totalItems = await eventModel.countDocuments() // get the total counts od Events
        const getEvents = await eventModel.find(filter, { name: 1, date: 1 }).skip(offset)
            .limit(limit).sort(sort)

        if (getEvents.length === 0) {
            return {
                message: messages.itemListNotFound.replace("Item", "Event"),
                data: [],
                status: statusCodeConstant.OK
            }
        }

        const { items, totalPages } = getPagingData(
            getEvents,
            _page,
            limit,
            totalItems
        );
        return {
            message: messages.fetListSuccess.replace("Item", messageConstant.EVENT),
            data: items,
            totalPages,
            totalItems,
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
};

/**
 * This api use for to get event by id
 * @param {*} eventId 
 * @returns 
 */
const getEventById = async (eventId) => {
    try {
        const getEvent = await eventModel.findOne({ _id: eventId }, {
            name: 1,
            description: 1,
            numberOfGroup: 1,
            date: 1
        })
        if (getEvent === null || getEvent === undefined) {
            return {
                message: messages.itemListNotFound.replace("Item list", "Event"),
                data: [],
                status: statusCodeConstant.NOT_FOUND
            }
        }
        return {
            message: messages.itemFetchSuccess.replace("Item", "Event"),
            data: getEvent,
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}
/**
 * This service is use for to delete the event 
 * @param {*} eventId 
 * @returns 
 */
const deleteAnEvent = async (eventId) => {
    try {
        const getEvent = await eventModel.findOne({ _id: eventId })
        if (getEvent === null || getEvent === undefined) {
            return {
                message: messages.itemListNotFound.replace("Item list", messageConstant.EVENT),
                status: statusCodeConstant.NOT_FOUND
            }
        }
        // Delete an event
        await eventModel.findOneAndDelete({ _id: eventId })
        return {
            message: messages.itemDeletedSuccess.replace("Item", messageConstant.EVENT),
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}

/**
 * This service use for to update the event
 * @param {*} eventId 
 * @param {*} eventBody 
 * @returns 
 */
const updateAnEvent = async (eventId, eventBody) => {
    try {
        const { name, description, date, numberOfGroup } = eventBody
        const findEvent = await eventModel.findOne({ _id: eventId })
        if (findEvent === null || findEvent === undefined) {
            return {
                message: messages.itemListNotFound.replace("Item list", messageConstant.EVENT),
                status: statusCodeConstant.NOT_FOUND
            }
        }
        await eventModel.findOneAndUpdate({ _id: eventId }, { $set: { name, description, date, numberOfGroup } })
        return {
            message: messages.itemUpdatedSuccess.replace("Item", messageConstant.EVENT),
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}

/**
 * This service use for to send event mail to members
 * @param {*} eventId 
 * @param {*} eventBody 
 * @returns 
 */
const postEmailsToMembers = async (eventId, eventBody) => {
    try {
        const memberList = await getGroupList(eventId.toString());
        let emailSubject = '';
        // Initialize an empty array for the emails
        let emailArray = [];
        // Loop through each group and push the emails to the new array
        Object.keys(memberList.data).forEach(group => {
            memberList.data[group].forEach(item => {
                emailSubject = item.event.name;
                if (item.groupMember && item.groupMember.member) {
                    emailArray.push(item.groupMember.member.email);
                }
            });
        });

        console.log('emailSubject--', emailSubject);

        // emailServiceV1(emailArray[0], eventBody,emailSubject)
        return {
            message: messages.emailSend,
            status: statusCodeConstant.OK,
            data: null
        }


    }
    catch (error) {
        throw errorHandler(error);
    }
}


export default {
    createEvent,
    listOfAnEvent,
    getEventById,
    deleteAnEvent,
    updateAnEvent,
    postEmailsToMembers
}
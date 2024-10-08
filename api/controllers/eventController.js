import { statusCodeConstant } from "../common/constant.js"
import { eventService } from "../services/index.js"
/**
 * This api is use for to created an event 
 * @param {*} req 
 * @param {*} res 
 */
const createEvent = async (req, res) => {
    try {
        const { message, status } = await eventService.createEvent(req.body)
        res.status(status ? status : statusCodeConstant.OK).json({ message, status })
    } catch (error) {
        console.log("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
/**
 * This api is use for to fetch the list of events
 * @param {*} req 
 * @param {*} res 
 */
const listOfAnEvent = async (req, res) => {
    try {
        const { search, searchByDate } = req.query
        const { message, status, data } = await eventService.listOfAnEvent(search, searchByDate)
        res.status(status ? status : statusCodeConstant.OK).json({ message, status, data })
    } catch (error) {
        console.log("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
/**
 * This controller is use for to get event by id
 * @param {*} req 
 * @param {*} res 
 */
const getEventById = async (req, res) => {
    try {
        const { id } = req.params
        const { message, status, data } = await eventService.getEventById(id)
        res.status(status ? status : statusCodeConstant.OK).json({ message, status, data })
    } catch (error) {
        console.log("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
/**
 * This controller is use for to delete an event
 * @param {*} req 
 * @param {*} res 
 */
const deleteAnEvent = async (req, res) => {
    try {
        const { id } = req.params
        const { message, status, data } = await eventService.deleteAnEvent(id)
        res.status(status ? status : statusCodeConstant.OK).json({ message, status, data })
    } catch (error) {
        console.log("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
/**
 * This controller is use for to update an event
 * @param {*} req 
 * @param {*} res 
 */
const updateAnEvent = async (req, res) => {
    try {
        const { id } = req.params
        const { message, status, data } = await eventService.updateAnEvent(id, req.body)
        res.status(status ? status : statusCodeConstant.OK).json({ message, status, data })
    } catch (error) {
        console.log("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
export default {
    createEvent,
    listOfAnEvent,
    getEventById,
    deleteAnEvent,
    updateAnEvent
}
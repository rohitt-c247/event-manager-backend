import { statusCodeConstant } from "../common/constant.js"
import { eventService } from "../services/index.js"

const createEvent = async (req, res) => {
    try {
        const { message, status } = await eventService.createEvent(req.body)
        res.status(status ? status : statusCodeConstant.OK).json({ message, status })
    } catch (error) {
        console.log("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
export default {
    createEvent
}
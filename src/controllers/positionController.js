import { statusCodeConstant } from "../common/index.js"
import positionService from "../services/positionService.js"

const getPositionList = async (req, res) => {
    try {
        const { message, status, data } = await positionService.getPositionList()
        res.status(status ? status : statusCodeConstant.OK).json({ message, status, data })
    } catch (error) {
        console.log("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}

export default {
    getPositionList
}
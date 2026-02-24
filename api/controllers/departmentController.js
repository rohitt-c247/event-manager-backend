import { statusCodeConstant } from "../common/constant.js"
import { departmentService } from "../services/index.js"

/**
 * This controller for to add the department
 * @param {*} req 
 * @param {*} res 
 */
const addDepartment = async (req, res) => {
    try {
        const { message, status } = await departmentService.addDepartment(req.body)
        res.status(status ? status : statusCodeConstant.OK).json({ message, status })
    } catch (error) {
        console.error("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}

/**
 * This controller is use for to get the list of department
 * @param {*} req 
 * @param {*} res 
 */
const getDepartment = async (req, res) => {
    try {
        const { message, status, data } = await departmentService.getDepartment()
        res.status(status ? status : statusCodeConstant.OK).json({ message, status, data })
    } catch (error) {
        console.error("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}

export default {
    addDepartment,
    getDepartment
}
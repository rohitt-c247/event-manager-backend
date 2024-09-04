import { statusCodeConstant } from "../common/index.js"
import { memberService } from "../services/index.js";
/**
 * This controller for to verify the user
 * @param {*} req 
 * @param {*} res 
 */
const verifyMemberLogin = async (req, res) => {
    try {
        const data = await memberService.verifyMemberLogin(req.body);
        res.status(statusCodeConstant.OK).json(data)
    } catch (error) {
        console.log("Error while login--", error);
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
/**
 * This controller for to add team members 
 * @param {*} req 
 * @param {*} res 
 */
const addTeamMembers = async (req, res) => {
    try {
        const { message, status } = await memberService.addTeamMembers(req.body)
        res.status(status ? status : statusCodeConstant.OK).json({ message, status })
    } catch (error) {
        console.log("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
/**
 * This api is use for to get the list of members
 * @param {*} req 
 * @param {*} res 
 */
const getMembers = async (req, res) => {
    try {
        const { _limit, _page, sortBy, sortOrder, search } = req.query
        const { message, status, data, totalPages, totalItems } = await memberService.getMembers(_limit, _page, sortBy, sortOrder, search)
        res.status(statusCodeConstant.OK).json({ message, status, data, totalPages, totalItems })
    } catch (error) {
        console.log("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
/**
 * This controller is use for to update the member
 * @param {*} req 
 * @param {*} res 
 */
const updateMember = async (req, res) => {
    try {
        const { id } = req.params
        const { message, status, data } = await memberService.updateMember(id, req.body)
        res.status(statusCodeConstant.OK).json({ message, status, data })
    } catch (error) {
        console.log("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
/**
 * This controller is use for to get the list of by id 
 * @param {*} req 
 * @param {*} res 
 */
const getMemberById = async (req, res) => {
    try {
        const { id } = req.params
        const { message, status, data } = await memberService.getMemberById(id)
        res.status(statusCodeConstant.OK).json({ message, status, data })
    } catch (error) {
        console.log("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
/**
 * This service use for to delete the member
 * @param {*} req 
 * @param {*} res 
 */
const deleteMember = async (req, res) => {
    try {
        const { id } = req.params
        const { message, status } = await memberService.deleteMember(id)
        res.status(statusCodeConstant.OK).json({ message, status })
    } catch (error) {
        console.log("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
export default {
    verifyMemberLogin,
    addTeamMembers,
    getMembers,
    getMemberById,
    updateMember,
    deleteMember
}
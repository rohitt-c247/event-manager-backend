import { statusCodeConstant } from "../common/index.js"
import { getGroupList, saveGroups, shiftMember } from "../services/groupService.js";

export const postGroup = async (req, res) => {
    try {
        const { message, status, data } = await saveGroups(req.body);
        res.status(status ? status : statusCodeConstant.OK).json({ message, status, data })
    } catch (error) {
        console.error("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}

export const getGroup = async (req, res) => {
    try {
        const { message, status, data } = await getGroupList(req.query.userId);
        res.status(status ? status : statusCodeConstant.OK).json(
            { message, status, data })
    } catch (error) {
        console.error("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}

export const shiftGroupMember = async (req, res) => {
    try {
        const { groupMemberId } = req.query;
        const { groupId } = req.body
        const { message, status, data } = await shiftMember(groupMemberId, groupId);
        res.status(status ? status : statusCodeConstant.OK).json(
            { message, status, data })
    } catch (error) {
        console.error("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
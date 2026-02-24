import { statusCodeConstant } from "../common/index.js"
import { createGroup, createGroupWithCommandPrompt, deleteGroupById, getGroupList, saveGroups, shiftMember, udpateGroupDetails } from "../services/groupService.js";

export const postGroup = async (req, res) => {
    try {
        const { message, status, data } = await createGroup(req.body);
        res.status(status ? status : statusCodeConstant.OK).json({ message, status, data })
    } catch (error) {
        console.error("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}

export const getGroup = async (req, res) => {
    try {
        const { eventId, pageNumber, pageSize } = req.query;
        //  Number(pageNumber), Number(pageSize)
        const { message, status, data } = await getGroupList(eventId);
        res.status(status ? status : statusCodeConstant.OK).json(
            { message, status, data })
    } catch (error) {
        console.error("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}

export const shiftGroupMember = async (req, res) => {
    try {
        /** shift member with in group doing manage group */
        const { groupMemberId } = req.query;
        const { groupId } = req.body
        const { message, status, data } = await shiftMember(groupMemberId, groupId, req.body.status);
        res.status(status ? status : statusCodeConstant.OK).json(
            { message, status, data })
    } catch (error) {
        console.error("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}

export const updateGroup = async (req, res) => {
    try {
        const { groupId } = req.query;
        const { name } = req.body
        const { message, status, data } = await udpateGroupDetails(groupId, name);
        res.status(status ? status : statusCodeConstant.OK).json(
            { message, status, data })
    } catch (error) {
        console.error("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}

export const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { message, status, data } = await deleteGroupById(id);
        res.status(status ? status : statusCodeConstant.OK).json(
            { message, status, data })
    } catch (error) {
        console.error("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}

export const createCustomGroup = async (req, res) => {
    try {
        const { userId, eventId } = req.params;
        //  Number(pageNumber), Number(pageSize)
        const { message, status, data } = await createGroupWithCommandPrompt(userId, eventId, req.query);
        res.status(status ? status : statusCodeConstant.OK).json(
            { message, status, data })
    } catch (error) {
        console.error("calling error", error)
        res.status(typeof error.status === "number" ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}
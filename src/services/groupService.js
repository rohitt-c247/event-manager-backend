import { errorHandler, messages, statusCodeConstant } from "../common/index.js";
import memberModel from "../models/memberModel.js";

export const saveGroups = async (data) => {
    try {
        const positionList = await memberModel.find({}, { name: 1 })
        return {
            message: messages.itemFetchSuccess.replace("Item", "Position"),
            data: positionList,
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}

export const getGroupList = async () => {
    try {
        const positionList = await memberModel.find({}, { name: 1 })
        return {
            message: messages.itemFetchSuccess.replace("Item", "Position"),
            data: positionList,
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}
import { errorHandler, messages, statusCodeConstant } from "../common/index.js";
import positionModel from "../models/positionModel.js";

const getPositionList = async () => {
    try {
        const positionList = await positionModel.find({}, { name: 1 })
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

export default {
    getPositionList
}
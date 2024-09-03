import { errorHandler, messageConstant, messages, statusCodeConstant } from "../common/index.js";
import departmentModel from "../models/departmentModel.js";
/**
 * This api is use for to add the department
 * @param {*} departmentBody 
 * @returns 
 */
const addDepartment = async (departmentBody) => {
    try {
        const { name } = departmentBody
        await departmentModel.create({
            name,
        })
        return {
            message: messages.itemAddedSuccess.replace("Item", messageConstant.DEPARTMENT),
            status: statusCodeConstant.CREATED
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
};
/**
 * THis api is use for to get the department list
 * @returns 
 */
const getDepartment = async () => {
    try {

        const departmentList = await departmentModel.find({}, { name: 1 })
        if (departmentList.length === 0) {
            return {
                message: messages.itemListNotFound.replace("Item", messageConstant.DEPARTMENT),
                data: [],
                status: statusCodeConstant.NOT_FOUND
            }
        }
        return {
            message: messages.fetListSuccess.replace("Item", messageConstant.DEPARTMENT),
            data: departmentList,
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
};
export default {
    addDepartment,
    getDepartment
}
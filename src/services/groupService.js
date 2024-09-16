import { errorHandler, messages, statusCodeConstant } from "../common/index.js";
import groupMembers from "../models/groupMembers.js";
import groupModel from "../models/groupModel.js";
import memberModel from "../models/memberModel.js";
import memberService from "./memberService.js";

export const saveGroups = async (data) => {
    try {
        let groups = [];
        const { name, userId } = data

        // groupMembers
        const members = await memberService.getMemberList();

        for (let i = 0; i < members.length; i += data.numberOfGroup) {
            groups.push(members.slice(i, i + data.numberOfGroup));
        }
        let transformedGroup = [];
        groups.forEach(async (gp, groupIndex) => {
            /**create group with name and save into db */
            const groupresult = await groupModel.create({
                userId,
                name: `${name}_group_${groupIndex + 1}`,
            });
            console.log('groupresult--', groupresult);

            // Iterate over each item in the group
            gp.forEach(async (item) => {
                await groupMembers.create({
                    _id: item._id,
                    memeberId: item._id, // Hardcoded for now, can be dynamic
                    creatorId: userId,           // Hardcoded for now, can be dynamic
                    groupId: groupresult._id          // Hardcoded for now, can be dynamic
                })

            });
        })

        // return transformedGroup
        // create group by event data

        // await groupMembers.insertMany(groups);
        return messages.itemAddedSuccess;
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
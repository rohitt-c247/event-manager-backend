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

        // format members
        // {
        //     userId,
        //     memberId,
        //     groupId
        // }
        console.log('--gr', groups);

        return
        // create group by event data
        await groupModel.create({
            userId,
            name,
        });
        await groupMembers.insertMany(groups);
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
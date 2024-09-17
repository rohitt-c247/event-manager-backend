import { errorHandler, messages, statusCodeConstant } from "../common/index.js";
import groupMembers from "../models/groupMembers.js";
import groupModel from "../models/groupModel.js";
import memberModel from "../models/memberModel.js";
import memberService from "./memberService.js";
import { ObjectId } from "mongodb";
export const saveGroups = async (data) => {
    try {
        let groups = [];
        const { name, userId } = data
        const members = await memberService.getMemberList();
        for (let i = 0; i < members.length; i += data.numberOfGroup) {
            groups.push(members.slice(i, i + data.numberOfGroup));
        }
        groups.forEach(async (gp, groupIndex) => {
            /**create group with name and save into db */
            const groupresult = await groupModel.create({
                userId,
                name: `${name}_group_${groupIndex + 1}`,
            });
            // Iterate over each item in the group
            gp.forEach(async (item) => {
                console.log(item._id.toHexString(), '----', typeof userId);
                const payload = {
                    memeberId: new ObjectId('66e2d9f68246faba90a1c984'),
                    creatorId: userId,
                    groupId: groupresult._id
                }
                console.log('payload---', payload);

                await groupMembers.create(payload)
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

export const getGroupList = async (userId) => {
    try {
        // const positionList = await memberModel.find({}, { name: 1 })
        // return {
        //     message: messages.itemFetchSuccess.replace("Item", "Position"),
        //     data: positionList,
        //     status: statusCodeConstant.OK
        // }
        const pipeline = [
            {
                // Match the document with the given userId
                $match: {
                    userId: ObjectId(userId)
                }
            },
            {
                // Convert memberId and groupId to ObjectId
                $addFields: {
                    memberId: { $convert: { input: "$memberId", to: "objectId", onError: null, onNull: null } },
                    groupId: { $convert: { input: "$groupId", to: "objectId", onError: null, onNull: null } }
                }
            },
            {
                // Optionally, you can lookup related data for memberId or groupId from another collection
                // Here, we are projecting only the fields we want
                $project: {
                    memberId: 1,
                    groupId: 1,
                    userId: 1
                }
            }
        ];

        const results = await memberModel.aggregate(pipeline).toArray();

        console.log('Aggregation Results:', results);
    }
    catch (error) {
        throw errorHandler(error);
    }
}

export const shiftMember = async (memberId, groupId) => {
    try {
        const results = await memberModel.aggregate(pipeline).toArray();
        await memberModel.findOneAndUpdate({ _id: groupMemberId }, { $set: { gro, description, date, numberOfGroup } })
        console.log('Aggregation Results:', results);
    }
    catch (error) {
        throw errorHandler(error);
    }
}
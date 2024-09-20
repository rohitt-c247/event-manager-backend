import { errorHandler, messages, statusCodeConstant } from "../common/index.js";
import groupMembers from "../models/groupMembers.js";
import groupModel from "../models/groupModel.js";
import memberService from "./memberService.js";

export const saveGroups = async (data) => {
    try {
        let groups = [];
        const { name, userId, eventId } = data
        const members = await memberService.getMemberList();
        for (let i = 0; i < members.length; i += data.numberOfGroup) {
            groups.push(members.slice(i, i + data.numberOfGroup));
        }
        groups.forEach(async (gp, groupIndex) => {
            /**create group with name and save into db */
            const groupresult = await groupModel.create({
                userId,
                eventId: eventId,
                name: `${name} group ${groupIndex + 1}`,
            });
            // Iterate over each item in the group
            gp.forEach(async (item) => {
                await groupMembers.create({
                    memberId: item._id.toString(),
                    userId,
                    groupId: groupresult._id
                });
            })
        })
        return messages.itemAddedSuccess;
    }
    catch (error) {
        throw errorHandler(error);
    }
}

export const getGroupList = async (userId) => {
    try {
        const result = await groupMembers.aggregate(
            [
                /**  Match the main data document */
                { $match: {} },
                {
                    $addFields: {
                        userId: {
                            $toObjectId: "$userId"
                        }
                    }
                },
                {
                    $addFields: {
                        memberId: {
                            $toObjectId: "$memberId"
                        }
                    }
                },
                {
                    $addFields: {
                        groupId: {
                            $toObjectId: "$groupId"
                        }
                    }
                },
                /** Lookup and join with User collection */
                {
                    $lookup: {
                        from: 'members', // The collection name of User schema (usually lowercase and plural)
                        localField: 'userId', // Field in MainData to match
                        foreignField: '_id', // Field in User schema to match
                        as: 'user' // Output array field with joined User data
                    }
                },

                // Lookup and join with Member collection
                {
                    $lookup: {
                        from: 'members', // The collection name of Member schema
                        localField: 'memberId', // Field in MainData to match
                        foreignField: '_id', // Field in Member schema to match
                        as: 'member' // Output array field with joined Member data
                    }
                },

                // Lookup and join with Group collection
                {
                    $lookup: {
                        from: 'groups', // The collection name of Group schema
                        localField: 'groupId', // Field in MainData to match
                        foreignField: '_id', // Field in Group schema to match
                        as: 'group' // Output array field with joined Group data
                    }
                },

                // Unwind arrays to get single objects
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$member', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$group', preserveNullAndEmptyArrays: true } },

                // Project the desired fields
                {
                    $project: {
                        userId: 1,
                        memberId: 1,
                        groupId: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        user: { name: 1, email: 1, position: 1, department: 1, experience: 1, isLoginAccess: 1 }, // Fields from member schema as user
                        member: { name: 1, email: 1, position: 1, department: 1, experience: 1, isLoginAccess: 1 }, // Fields from Member schema
                        group: { name: 1, _id: 1 } // Fields from Group schema
                    }
                }
            ]
        );
        return {
            message: messages.groupFetchSuccess,
            data: result,
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}

export const shiftMember = async (groupMemberId, groupId) => {
    try {
        const result = await groupMembers.findOneAndUpdate(
            { _id: groupMemberId },
            {
                $set: { groupId: groupId }
            })
        return {
            message: messages.itemUpdatedSuccess,
            data: null,
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}


export const udpateGroupDetails = async (groupId, name) => {
    try {
        await groupModel.findOneAndUpdate(
            { _id: groupId },
            {
                $set: { name: name }
            })
        return {
            message: messages.itemUpdatedSuccess,
            data: null,
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}

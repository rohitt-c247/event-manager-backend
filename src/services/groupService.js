import { errorHandler, messages, statusCodeConstant } from "../common/index.js";
import groupMembers from "../models/groupMembers.js";
import groupModel from "../models/groupModel.js";
import { emailService } from "./emailService.js";
import memberService from "./memberService.js";

export const saveGroups = async (data) => {
    try {
        emailService(["shanti.c@chapter247.com"])
        return
        let memberEmails = [];
        let groups = [];

        const { name, userId, eventId } = data
        const members = await memberService.getMemberList();
        for (let i = 0; i < members.length; i += data.numberOfGroup) {
            groups.push(members.slice(i, i + data.numberOfGroup));
        }
        /** Loop through each group and process it asynchronously */
        for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
            const gp = groups[groupIndex];

            /** Create the group in the database */
            const groupresult = await groupModel.create({
                userId,
                eventId,
                name: `${name} group ${groupIndex + 1}`,
            });

            /** Create an array to store email promises */
            const emailPromises = gp.map(async (item) => {
                /** Add member's email to memberEmails array */
                memberEmails.push(item.email);
                /** Create a group member entry in the database */
                await groupMembers.create({
                    memberId: item._id.toString(),
                    userId,
                    groupId: groupresult._id,
                    eventId: eventId
                });
            });

            /** Wait for all promises in the current group to complete */
            await Promise.all(emailPromises);
        }
        /** send mail to the group members */
        // emailService(memberEmails)
        return messages.itemAddedSuccess;
    }
    catch (error) {
        throw errorHandler(error);
    }
}

export const getGroupList = async (eventId, page, limit) => {
    try {
        const skip = (page - 1) * limit;
        const result = await groupMembers.aggregate(
            [
                /**  Match the main data document */
                { $match: { eventId: eventId } },
                {
                    $addFields: {
                        eventId: {
                            $toObjectId: "$eventId"
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
                        from: 'events', // The collection name of User schema (usually lowercase and plural)
                        localField: 'eventId', // Field in MainData to match
                        foreignField: '_id', // Field in User schema to match
                        as: 'event' // Output array field with joined User data
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
                { $unwind: { path: '$event', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$member', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$group', preserveNullAndEmptyArrays: true } },

                // Project the desired fields
                {
                    $project: {
                        eventId: 1,
                        memberId: 1,
                        groupId: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        event: { name: 1, description: 1, numberOfGroup: 1, date: 1 }, // Fields from event schema as user
                        member: { name: 1, email: 1, position: 1, department: 1, experience: 1, isLoginAccess: 1 }, // Fields from Member schema
                        group: { name: 1, _id: 1 } // Fields from Group schema
                    }
                },
                // Pagination
                { $skip: skip },   // Skip the documents based on the page number
                { $limit: limit }  // Limit the documents to the specified amount
            ]
        );
        const totalRecords = await groupMembers.countDocuments({ eventId: eventId }); // Get total count for the event
        const groupedByGroupId = result.reduce((acc, item) => {
            const groupName = item.group.name;
            if (!acc[groupName]) {
                acc[groupName] = [];
            }
            acc[groupName].push(item);
            return acc;
        }, {});

        return {
            message: messages.groupFetchSuccess,
            total: totalRecords,
            data: groupedByGroupId,
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
            });
        return {
            message: messages.itemUpdatedSuccess.replace("Item", "Group member"),
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
            message: messages.itemUpdatedSuccess.replace("Item", "Group"),
            data: null,
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}

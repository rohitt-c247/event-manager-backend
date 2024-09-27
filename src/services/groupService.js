import { errorHandler, messageConstant, messages, statusCodeConstant } from "../common/index.js";
import groupMembers from "../models/groupMembers.js";
import groupModel from "../models/groupModel.js";
import memberService from "./memberService.js";

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function distributeIntoGroups(members, numGroups) {
    const groups = [];
    const totalMembers = members.length;
    const minGroupSize = Math.floor(totalMembers / numGroups);  // Minimum size each group can have
    let remainingMembers = totalMembers % numGroups;  // Extra members to distribute

    let startIndex = 0;

    for (let i = 0; i < numGroups; i++) {
        let groupSize = minGroupSize;
        // Distribute the extra members across the first few groups
        if (remainingMembers > 0) {
            groupSize += 1;
            remainingMembers--;
        }

        const group = members.slice(startIndex, startIndex + groupSize);
        groups.push(group);
        startIndex += groupSize;
    }

    return groups;
}
export const saveGroups = async (data) => {
    try {
        let groups = [];
        const { name, userId, eventId } = data;
        /** Step 1: List of members  */
        const members = await memberService.getMemberList();
        /**  Step 2: Shuffle members randomly */
        const shuffledMembers = shuffleArray([...members]);
        /** Create distribute members into groups */
        const numGroups = data.numberOfGroup;
        groups = distributeIntoGroups(shuffledMembers, numGroups);
        /** step 4: store members  by create group  */
        groups.forEach(async (gp, groupIndex) => {
            /**create group with name and save into db */
            const groupresult = await groupModel.create({
                userId,
                eventId: eventId,
                name: `group ${groupIndex + 1}`,
            });
            /** Iterate over each item in the group */
            gp.forEach(async (item) => {
                await groupMembers.create({
                    memberId: item._id.toString(),
                    userId,
                    groupId: groupresult._id,
                    eventId: eventId
                });
            })
        })
        return messages.itemAddedSuccess;
    }
    catch (error) {
        throw errorHandler(error);
    }
}

export const getGroupList = async (eventId, page, limit) => {
    try {
        // const skip = (page - 1) * limit;
        const result = await groupModel.aggregate(
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
                        userId: {
                            $toObjectId: "$userId"
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
                        localField: 'userId', // Field in MainData to match
                        foreignField: '_id', // Field in Member schema to match
                        as: 'user' // Output array field with joined Member data
                    }
                },
                {
                    $lookup: {
                        from: 'groupmembers', // The collection name of Member schema
                        let: { groupId: { $toString: '$_id' } }, // Convert groupId to string
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: ['$groupId', '$$groupId'] // Match groupId as string in groupmembers
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
                                $lookup: {
                                    from: 'members', // Join back to members collection to get member details
                                    localField: 'memberId', // Field in GroupMembers to match
                                    foreignField: '_id', // Field in Members to match
                                    as: 'member' // Output array field with joined Member data
                                }
                            }
                        ],
                        // localField: '_id', // Field in MainData to match
                        // foreignField: 'groupId', // Field in Member schema to match
                        as: 'groupMember' // Output array field with joined Member data
                    }
                },
                // Lookup and join with Group collection
                {
                    $lookup: {
                        from: 'groupmembers', // The collection name of Group schema
                        localField: 'groupId', // Field in MainData to match
                        foreignField: '_id', // Field in Group schema to match
                        as: 'group' // Output array field with joined Group data
                    }
                },

                // Unwind arrays to get single objects
                { $unwind: { path: '$event', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$group', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$groupMember', preserveNullAndEmptyArrays: true } },
                { $unwind: { path: '$groupMember.member', preserveNullAndEmptyArrays: true } }, // Unwind memberDetails array
                // Project the desired fields
                // Project the desired fields
                {
                    $project: {
                        eventId: 1,
                        memberId: 1,
                        name: 1,
                        groupId: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        event: { name: 1, description: 1, numberOfGroup: 1, date: 1 }, // Fields from event schema as user
                        userId: { name: 1, email: 1, position: 1, department: 1, experience: 1, isLoginAccess: 1 }, // Fields from Member schema
                        group: { name: 1, _id: 1 }, // Fields from Group schema
                        groupMember: {
                            _id: 1,
                            memberId: 1,
                            groupId: 1,
                            member: {
                                name: 1,
                                email: 1,
                                position: 1,
                                department: 1
                            }
                        }
                    }
                },
                // Pagination
                // { $skip: skip },   // Skip the documents based on the page number
                // { $limit: limit }  // Limit the documents to the specified amount
            ]
        );
        const totalRecords = await groupMembers.countDocuments({ eventId: eventId });
        const groupedData = result.reduce((acc, member) => {
            const groupName = member.name;
            // Initialize the group if it doesn't exist
            if (!acc.data[groupName]) {
                acc.data[groupName] = [];
            }
            // Push the member data to the corresponding group
            acc.data[groupName].push(member);
            return acc;
        }, { data: {} });
        /** format data of groups by index */
        const unfilteredGroupData = groupedData.data;
        const formattedData = {};
        const groupsKeys = Object.keys(unfilteredGroupData);
        groupsKeys.forEach((group, index) => {
            if (group.includes('group')) {
                const newGroupName = `group ${index + 1}`;
                formattedData[newGroupName] = unfilteredGroupData[group];
            } else {
                formattedData[group] = unfilteredGroupData[group];
            }
        });
        return {
            message: messages.groupFetchSuccess,
            total: totalRecords,
            data: formattedData,
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


/**
 * This Service use for to delete the group and group Members
 * @param {*} id 
 * @returns 
 */
export const deleteGroupById = async (groupId) => {
    try {
        const groupDetail = await groupModel.findOne({ _id: groupId })
        if (groupDetail === null || groupDetail === undefined) {
            return {
                message: messages.itemListNotFound.replace("Item list", messageConstant.GROUP),
                status: statusCodeConstant.NOT_FOUND,
                data: null
            }
        }
        /** Delete group from db */
        await groupModel.findOneAndDelete({ _id: groupId });
        /** Delete member related to the group */
        await groupMembers.deleteMany({
            groupId: groupId
        })
        return {
            message: messages.deleteGroup,
            status: statusCodeConstant.OK,
            data: null
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}

export const createGroup = async (data) => {
    try {
        let groups = [];
        const { name, userId, eventId } = data;
        const groupCount = await groupModel.find({ eventId: eventId })
        /**create group with name and save into db */
        await groupModel.create({
            userId,
            eventId: eventId,
            name: `group ${groupCount + 1}`,
        });
        // const members = await memberService.getMemberList();
        // for (let i = 0; i < members.length; i += data.numberOfGroup) {
        //     groups.push(members.slice(i, i + data.numberOfGroup));
        // }
        // groups.forEach(async (gp, groupIndex) => {
        //     /**create group with name and save into db */
        //     const groupresult = await groupModel.create({
        //         userId,
        //         eventId: eventId,
        //         name: `${name} group ${groupIndex + 1}`,
        //     });
        //     // Iterate over each item in the group
        //     gp.forEach(async (item) => {
        //         await groupMembers.create({
        //             memberId: item._id.toString(),
        //             userId,
        //             groupId: groupresult._id,
        //             eventId: eventId
        //         });
        //     })
        // })        
        return {
            message: messages.itemAddedSuccess.replace("Item", messageConstant.GROUP),
            status: statusCodeConstant.CREATED
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}
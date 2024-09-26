import { errorHandler, messageConstant, messages, statusCodeConstant } from "../common/index.js";
import groupMembers from "../models/groupMembers.js";
import groupModel from "../models/groupModel.js";
import { emailService } from "./emailService.js";
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
        let memberEmails = [];
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
        const allPromises = [];
        groups.forEach((gp, groupIndex) => {
            // Create group with name and save into db
            const groupPromise = groupModel.create({
                userId,
                eventId,
                name: `group ${groupIndex + 1}`,
            }).then(groupresult => {
                // Store member emails
                memberEmails = memberEmails.concat(gp.map(item => item.email));
                // Iterate over each item in the group and create the groupMembers
                const memberPromises = gp.map(item => {
                    return groupMembers.create({
                        memberId: item._id.toString(),
                        userId,
                        groupId: groupresult._id,
                        eventId
                    });
                });
                // Add all member creation promises to the array
                allPromises.push(...memberPromises);
            });
            // Add the group creation promise to the array
            allPromises.push(groupPromise);
        });
        // Wait for all promises (group and member creation) to complete
        await Promise.all(allPromises);
        const memberList = await getGroupList(eventId.toString());
        console.log(memberList.data);
        /** send mail to the group members */
        // emailService(memberEmails, memberList.data)
        return messages.itemAddedSuccess;
    }
    catch (error) {
        throw errorHandler(error);
    }
}

export const getGroupList = async (eventId) => {
    try {
        // const skip = (page - 1) * limit;
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
                // // Pagination
                // { $skip: skip },   // Skip the documents based on the page number
                // { $limit: limit }  // Limit the documents to the specified amount
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
        /** format data of groups by index */
        const formattedData = {};
        const groupsKeys = Object.keys(groupedByGroupId);
        groupsKeys.forEach((group, index) => {
            if (group.includes('group')) {
                const newGroupName = `group ${index + 1}`;
                formattedData[newGroupName] = groupedByGroupId[group];
            } else {
                formattedData[group] = groupedByGroupId[group];
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
        const { name, userId, eventId } = data
        /**create group with name and save into db */
        await groupModel.create({
            userId,
            eventId: eventId,
            name: `${name} group ${groupIndex + 1}`,
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
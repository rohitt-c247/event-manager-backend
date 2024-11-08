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

    // Separate experienced members (assuming experience is stored in 'experience' field)
    const experiencedMembers = members.filter(member => member.experience > 2); // Adjust experience threshold as needed
    const nonExperiencedMembers = members.filter(member => member.experience <= 2);

    // Shuffle arrays to ensure randomness
    shuffleArray(experiencedMembers);
    shuffleArray(nonExperiencedMembers);

    // Special condition: if there are 4 members but numGroups is greater than 2, enforce 2 groups
    if (totalMembers === 4 && numGroups > 2) {
        // Create 2 groups: first group has 3 members, second group has the remaining
        groups.push(members.slice(0, 3));
        return groups;
    }

    // Ensure at least 3 members per group if possible
    if (numGroups * 3 > totalMembers) {
        numGroups = Math.ceil(totalMembers / 3);  // Adjust the number of groups to satisfy the minimum size condition
    }

    const minGroupSize = Math.floor(totalMembers / numGroups);  // Minimum size each group can have
    let remainingMembers = totalMembers % numGroups;  // Extra members to distribute

    let startIndex = 0;

    // Distribute groups while ensuring one experienced member in each group
    for (let i = 0; i < numGroups; i++) {
        let groupSize = minGroupSize;
        if (remainingMembers > 0) {
            groupSize += 1;
            remainingMembers--;
        }

        let group = [];

        // Ensure at least one experienced member in each group
        if (experiencedMembers.length > 0) {
            group.push(experiencedMembers.pop()); // Add one experienced member to each group
        }

        // Add non-experienced members to fill the rest of the group
        while (group.length < groupSize && nonExperiencedMembers.length > 0) {
            group.push(nonExperiencedMembers.pop());
        }

        // If the group is underfilled, distribute remaining experienced members
        if (group.length < groupSize && experiencedMembers.length > 0) {
            group.push(experiencedMembers.pop());
        }

        groups.push(group);
    }

    // Check if there are any unassigned members left
    const assignedMembers = groups.flat();
    const unassignedMembers = members.filter(member => !assignedMembers.includes(member));

    if (unassignedMembers.length > 0) {
        // Optionally, add these unassigned members to the last group or a new group
        if (groups.length > 0) {
            groups[groups.length - 1].push(...unassignedMembers);  // Add to the last group
        } else {
            groups.push(unassignedMembers);  // Add as a new group
        }
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
        // /**  Step 2: Shuffle members randomly */
        const shuffledMembers = shuffleArray([...members]);
        // /** Create distribute members into groups */
        const numGroups = data.numberOfGroup;
        groups = distributeIntoGroups(shuffledMembers, numGroups);
        /** step 4: store members  by create group  */
        const allPromises = [];
        // const groupsList = await createGroupWithCommandPrompt(shuffledMembers)
        groups.forEach((gp, groupIndex) => {
            // Create group with name and save into db
            const groupPromise = groupModel.create({
                userId,
                eventId,
                name: `Group ${groupIndex + 1}`,
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

        // create one pending group
        const res = await groupModel.create({
            userId,
            eventId,
            name: ` Pending group`,
            status: 'pending'
        })
        const memberList = await getGroupList(eventId.toString());
        /** send mail to the group members */
        // emailService(memberEmails, memberList.data,name)
        return messages.itemAddedSuccess;
    }
    catch (error) {
        throw errorHandler(error);
    }
}

export const getGroupList = async (eventId) => {
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
                        userId: { name: 1, email: 1, position: 1, department: 1, experience: 1, isLoginAccess: 1, rating: 1 }, // Fields from Member schema
                        group: { name: 1, _id: 1 }, // Fields from Group schema
                        groupMember: {
                            _id: 1,
                            memberId: 1,
                            groupId: 1,
                            member: {
                                name: 1,
                                email: 1,
                                position: 1,
                                department: 1,
                                experience: 1,
                                rating: 1
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
            if (group.trim().includes('Group')) {
                const newGroupName = `Group ${index + 1}`;
                formattedData[newGroupName] = unfilteredGroupData[group];
            } else {
                formattedData[group.trim()] = unfilteredGroupData[group];
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

export const shiftMember = async (groupMemberId, groupId, status) => {
    try {
        const result = await groupMembers.findOneAndUpdate(
            { _id: groupMemberId },
            {
                $set: { groupId: groupId, status: status }
            })
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
        // await groupMembers.deleteMany({
        //     groupId: groupId
        // })

        /** set delete group member inside pending group */
        const pendingGroup = await groupModel.findOne({ status: 'pending', eventId: groupDetail.eventId })
        const groupMemberList = await groupMembers.find({ groupId: groupId })
        groupMemberList.forEach(async (item) => {
            // shift members in pending groups
            await groupMembers.findOneAndUpdate({ _id: item._id },
                {
                    $set: { groupId: pendingGroup._id }
                });

        });
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

function manageMemberWithGroups(members, data) {
    let numGroups = data.numberOfGroup;
    let groups = [];
    let filteredMember = members;
    // Filter only  department members
    if (data && data.department) {
        filteredMember = members.filter(member => member.department === data.department);
    }
    if (data && data.position) {
        filteredMember = members.filter(member => member.position === data.position);
    }
    if (data && data.position && data && data.department) {
        filteredMember = members.filter(member => member.position === data.position && member.department === data.department);
    }
    const totalMembers = filteredMember.length;
    // Split HR members into seniors and juniors
    let seniors = filteredMember.filter(member => member.experience > 2);
    let juniors = filteredMember.filter(member => member.experience <= 2);
    // Special condition: if there are 4 members but numGroups is greater than 2, enforce 2 groups
    if (totalMembers === 4 && numGroups > 2) {
        // First group must have 3 members, ensuring at least one senior
        groups.push([seniors[0], ...juniors.slice(0, 2)]); // Group of 3 (1 senior, 2 juniors)
        groups.push(juniors.slice(2)); // Remaining group of juniors
        return groups;
    }
    // Ensure at least 3 members per group if possible
    if (numGroups * 3 > totalMembers) {
        numGroups = Math.ceil(totalMembers / 3); // Adjust numGroups to satisfy the minimum size condition
    }

    let minGroupSize = Math.floor(totalMembers / numGroups); // Minimum size each group can have
    let remainingMembers = totalMembers % numGroups; // Extra members to distribute

    let startIndex = 0;

    // Track assigned members to prevent duplicates
    let assignedMembers = new Set();

    for (let i = 0; i < numGroups; i++) {
        let groupSize = minGroupSize;
        // Distribute the extra members across the first few groups
        if (remainingMembers > 0) {
            groupSize += 1;
            remainingMembers--;
        }

        let group = [];

        // Ensure there's at least one senior in each group
        if (seniors.length > 0) {
            let senior = seniors.shift(); // Take a senior from the seniors array
            group.push(senior);
            assignedMembers.add(senior); // Mark the senior as assigned
        }

        // Fill the rest of the group with juniors or remaining members
        for (let j = startIndex; group.length < groupSize && j < juniors.length; j++) {
            let junior = juniors[j];
            if (!assignedMembers.has(junior)) {
                group.push(junior);
                assignedMembers.add(junior); // Mark the junior as assigned
                startIndex++;
            }
        }

        groups.push(group);
    }

    // Check if there are any unassigned members left
    const unassignedMembers = filteredMember.filter(member => !assignedMembers.has(member));

    if (unassignedMembers.length > 0) {
        // Optionally, add these unassigned members to the last group or a new group
        if (groups.length > 0) {
            groups[groups.length - 1].push(...unassignedMembers); // Add to the last group
        } else {
            groups.push(unassignedMembers); // Add as a new group
        }
    }

    return groups;
}

export const createGroupWithCommandPrompt = async (userId, eventId, requestParams) => {
    try {
        const members = await memberService.getMemberList();
        const groups = manageMemberWithGroups(members, requestParams)
        groups.forEach((gp, groupIndex) => {
            // Create group with name and save into db
            groupModel.create({
                userId: userId,
                eventId: eventId,
                name: `Group ${groupIndex + 1}`,
            }).then(groupresult => {
                gp.map(item => {
                    return groupMembers.create({
                        memberId: item._id.toString(),
                        userId,
                        groupId: groupresult._id,
                        eventId
                    });
                });
            });
        });
        return {
            message: messages.itemAddedSuccess.replace("Item", messageConstant.GROUP),
            status: statusCodeConstant.CREATED,
            data: null
        }
    }
    catch (error) {
        console.log('error"', error);
        throw errorHandler(error);
    }
}
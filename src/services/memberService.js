
import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client();
import { FRONT_APP_URL, FRONT_END_GOOGLE_CALLBACK, GOOGLE_CLIENT_ID, GOOGLE_SECRET_ID, ORGANIZATION_DOMAIN } from "../config/envConfig.js";
import memberModel from "../models/memberModel.js";
import { messages } from "../common/messages.js";
import { messageConstant, sortingConstant, statusCodeConstant } from "../common/constant.js";
import { errorHandler } from "../common/errorHandler.js";
import { getPagination, getPagingData } from "../helpers/paginationHelper.js";
/**
 * This service is use for to verify the member login
 * @param {*} auth 
 * @returns 
 */
const verifyMemberLogin = async (auth) => {
    try {
        // Getting code from the frontend
        const { code } = auth;
        console.log("code", code)
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_SECRET_ID,
            `${FRONT_APP_URL}${FRONT_END_GOOGLE_CALLBACK}`    //'postmessage' // we can pass here redirect_url as well, but as we are doing it by the google login popup so its not required
        );

        /**
            ** Getting tokens from the code that was submitted from client side
            ** In the token object we will get multiple things like access_token, refresh_token, scope, id_token & expiry_date
         */
        const { tokens } = await oauth2Client.getToken(code)

        const idToken = tokens.id_token;
        const userInfo = await client.verifyIdToken({
            idToken, // Getting IdToken from the frontend ( Client side )
            audience: GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = userInfo.getPayload();
        const getUserDetail = await memberModel.findOne({ email: payload.email, isLoginAccess: true })
        const isVerifiedUser = payload.email.includes(ORGANIZATION_DOMAIN) // Check with only {{chapter247.com}} organization email will login
        /**
         * {{payload.hd}} should be 'chapter247.com' to check only this organization will work
         */
        if (getUserDetail && payload.hd === ORGANIZATION_DOMAIN && isVerifiedUser) {
            /** update google picture of logedin user  */
            await memberModel.findOneAndUpdate({ _id: getUserDetail._id },
                { $set: { picture: payload.picture } })
            return {
                message: messages.memberLoginSuccess,
                data: {
                    id: getUserDetail._id.toHexString(),
                    name: getUserDetail.name,
                    picture: payload.picture || '',
                },
                status: statusCodeConstant.OK
            }
        } else {
            return {
                message: messages.contactToAdmin,
                data: null,
                status: statusCodeConstant.FORBIDDEN
            }
        }
    } catch (error) {
        console.log("Error while login++++++++++", error)
        throw errorHandler(error)
    }
}
/**
 * This service is use for to add members
 * @param {*} memberBody 
 * @returns 
 */
const addTeamMembers = async (memberBody) => {
    try {
        const { name, email, position, department, experience, isLoginAccess } = memberBody
        /** check if update already exist email */
        if (memberBody.email != null) {
            if (await memberModel.findOne({ email: memberBody.email }) != null) {
                throw {
                    message: messages.alreadyExist,
                    status: statusCodeConstant.BAD_REQUEST
                };
            }
        }
        await memberModel.create({
            name,
            email,
            position,
            department,
            experience,
            isLoginAccess
        });
        return {
            message: messages.itemAddedSuccess.replace("Item", messageConstant.MEMBER),
            status: statusCodeConstant.CREATED
        }
    }
    catch (error) {
        if (error?.status === 400) {
            throw error;
        }
        throw errorHandler?.(error) ?? error;
    }
};
/**
 * This api is use for to get list members
 * @returns 
 */
const getMembers = async (_limit, _page, sortBy, sortOrder, search, department, position, loginAccess) => {
    try {
        const { limit, offset } = getPagination(_page, _limit);
        /**
         * Manage sorting and pagination
         */
        let sort = {};
        const filter = {};
        if (search) {
            filter["name"] = { $regex: search, $options: "i" };
        }

        // find by Department
        if (department) {
            filter["department"] = { $regex: department, $options: "i" };
        }
        // find by Position
        if (position) {
            filter["position"] = { $regex: position, $options: "i" };
        }
        // find by login access
        if (loginAccess) {
            filter["isLoginAccess"] = loginAccess;
        }

        if (sortBy && sortOrder) {
            sort[sortBy] = sortOrder === sortingConstant.ASC ? 1 : -1;
        } else {
            // Default sorting if no sortBy and sortOrder provided
            sort = { createdAt: 1 };
        }
        const totalItems = await memberModel.countDocuments() // get the total counts od members
        const getMembers = await memberModel.find(filter, { name: 1, email: 1, position: 1, department: 1, experience: 1, isLoginAccess: 1 }).skip(offset)
            .limit(limit).sort(sort)

        if (getMembers.length === 0) {
            return {
                message: messages.itemListNotFound.replace("Item", messageConstant.MEMBER),
                data: [],
                status: statusCodeConstant.NOT_FOUND
            }
        }
        const { items, totalPages } = getPagingData(
            getMembers,
            _page,
            limit,
            totalItems
        );
        return {
            message: messages.fetListSuccess.replace("Item", messageConstant.MEMBER),
            data: items,
            totalPages,
            totalItems,
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
};
/**
 * This service use for to get the details of the member
 * @param {*} memberId 
 * @returns 
 */
const getMemberById = async (memberId) => {
    try {
        const getMember = await memberModel.findOne({ _id: memberId }, { name: 1, email: 1, department: 1, position: 1, experience: 1, isLoginAccess: 1, picture: 1 })
        if (getMember === null || getMember === undefined) {
            return {
                message: messages.itemListNotFound.replace("Item list", messageConstant.MEMBER),
                data: getMember,
                status: statusCodeConstant.NOT_FOUND
            }
        }
        return {
            message: messages.itemFetchSuccess.replace("Item", messageConstant.MEMBER),
            data: getMember,
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}

/**
 * This service is use for to update the team details
 * Any Admin can edit the details so that why passing id
 * @param {*} memberId 
 */
const updateMember = async (memberId, memberBody) => {
    try {
        console.log('kkk', memberBody);

        const { name, email, department, position, experience, isLoginAccess } = memberBody
        const findMember = await memberModel.findOne({ _id: memberId })
        if (findMember === null || findMember === undefined) {
            return {
                message: messages.itemListNotFound.replace("Item list", messageConstant.MEMBER),
                status: statusCodeConstant.NOT_FOUND
            }
        }
        /** check if update already exist email */
        if (memberBody.email != null && memberBody.email != findMember.email) {
            if (await memberModel.findOne({ email: memberBody.email }) != null) {
                throw {
                    message: messages.alreadyExist,
                    status: statusCodeConstant.BAD_REQUEST
                };
            }
        }
        await memberModel.findOneAndUpdate({ _id: memberId }, { $set: { name, email, department, position, experience, isLoginAccess } })
        return {
            message: messages.itemUpdatedSuccess.replace("Item", messageConstant.MEMBER),
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        if (error?.status === 400) {
            throw error;
        }
        throw errorHandler?.(error) ?? error;
    }
}
/**
 * This Service use for to delete the member
 * @param {*} memberId 
 * @returns 
 */
const deleteMember = async (memberId) => {
    try {
        const getMember = await memberModel.findOne({ _id: memberId })
        if (getMember === null || getMember === undefined) {
            return {
                message: messages.itemListNotFound.replace("Item list", messageConstant.MEMBER),
                status: statusCodeConstant.NOT_FOUND
            }
        }
        await memberModel.findOneAndDelete({ _id: memberId })
        return {
            message: messages.itemDeletedSuccess.replace("Item", messageConstant.MEMBER),
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}

// /**
//  * This api for get authorized team members
//  * @returns 
//  */
// const authMemberList = async (_limit, _page, sortBy, sortOrder, search) => {
//     try {
//         const { limit, offset } = getPagination(_page, _limit);
//         /**
//          * Manage sorting and pagination
//          */
//         let sort = {};
//         const filter = {};
//         if (search) {
//             filter["name"] = { $regex: search, $options: "i" };
//         }
//         if (sortBy && sortOrder) {
//             sort[sortBy] = sortOrder === sortingConstant.ASC ? 1 : -1;
//         } else {
//             // Default sorting if no sortBy and sortOrder provided
//             sort = { createdAt: 1 };
//         }
//         const totalItems = await memberModel.countDocuments() // get the total counts od members
//         const getMembers = await memberModel.find(filter, { name: 1, email: 1, position: 1, department: 1, experience: 1, isLoginAccess: 1 }).skip(offset)
//             .limit(limit).sort(sort)

//         if (getMembers.length === 0) {
//             return {
//                 message: messages.itemListNotFound.replace("Item", messageConstant.MEMBER),
//                 data: [],
//                 status: statusCodeConstant.NOT_FOUND
//             }
//         }
//         const { items, totalPages } = getPagingData(
//             getMembers,
//             _page,
//             limit,
//             totalItems
//         );
//         return {
//             message: messages.fetListSuccess.replace("Item", messageConstant.MEMBER),
//             data: items,
//             totalPages,
//             totalItems,
//             status: statusCodeConstant.OK
//         }
//     }
//     catch (error) {
//         throw errorHandler(error);
//     }
// };

/**
 * This API is used to get a list of uthorized team members.
 * @returns {object} Response containing members data and pagination info
 */
const authMemberList = async (_limit, _page, sortBy, sortOrder, search) => {
    try {
        const { limit, offset } = getPagination(_page, _limit);
        const sort = {};

        // Construct search filter
        const matchStage = { isLoginAccess: true };
        if (search) {
            matchStage["name"] = { $regex: search, $options: "i" };
        }

        // Handle sorting
        if (sortBy && sortOrder) {
            sort[sortBy] = sortOrder === sortingConstant.ASC ? 1 : -1;
        } else {
            // Default sorting by creation date
            sort["createdAt"] = 1;
        }

        // Aggregation pipeline
        const pipeline = [
            { $match: matchStage }, // Filter matching members
            {
                $project: {
                    name: 1,
                    email: 1,
                    position: 1,
                    department: 1,
                    experience: 1,
                    isLoginAccess: 1,
                }
            },
            { $sort: sort }, // Apply sorting
            { $skip: offset }, // Skip documents for pagination
            { $limit: limit }, // Limit the number of documents
        ];

        // Get total count of matching members
        const totalItems = await memberModel.countDocuments(matchStage);

        // Get members using aggregation
        const getMembers = await memberModel.aggregate(pipeline);

        if (getMembers.length === 0) {
            return {
                message: messages.itemListNotFound.replace("Item", messageConstant.MEMBER),
                data: [],
                status: statusCodeConstant.NOT_FOUND,
            };
        }

        // Calculate total pages
        const totalPages = Math.ceil(totalItems / limit);

        return {
            message: messages.fetListSuccess.replace("Item", messageConstant.MEMBER),
            data: getMembers,
            totalPages,
            totalItems,
            status: statusCodeConstant.OK,
        };
    } catch (error) {
        throw errorHandler(error);
    }
};


const getMemberList = async (memberId) => {
    try {
        const members = await memberModel.find({})
        return members;
    }
    catch (error) {
        throw errorHandler(error);
    }
}

export default {
    verifyMemberLogin,
    addTeamMembers,
    getMembers,
    getMemberById,
    updateMember,
    deleteMember,
    authMemberList,
    getMemberList
}
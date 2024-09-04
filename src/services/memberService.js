
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
        const getUserDetail = await memberModel.find({ email: payload.email, isLoginAccess: true })
        const isVerifiedUser = payload.email.includes(ORGANIZATION_DOMAIN) // Check with only {{chapter247.com}} organization email will login
        /**
         * {{payload.hd}} should be 'chapter247.com' to check only this organization will work
         */
        if (getUserDetail.length && payload.hd === ORGANIZATION_DOMAIN && isVerifiedUser) {
            return {
                message: messages.memberLoginSuccess,
                status: statusCodeConstant.OK
            }
        } else {
            return {
                message: messages.contactToAdmin,
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
        await memberModel.create({
            name,
            email,
            position,
            department,
            experience,
            isLoginAccess
        })
        return {
            message: messages.itemAddedSuccess.replace("Item", messageConstant.MEMBER),
            status: statusCodeConstant.CREATED
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
};
/**
 * This api is use for to get list members
 * @returns 
 */
const getMembers = async (_limit, _page, sortBy, sortOrder) => {
    try {
        const { limit, offset } = getPagination(_page, _limit);
        /**
         * Manage sorting and pagination
         */
        let sort = {};
        if (sortBy && sortOrder) {
            sort[sortBy] = sortOrder === sortingConstant.ASC ? 1 : -1;
        } else {
            // Default sorting if no sortBy and sortOrder provided
            sort = { createdAt: 1 };
        }
        const totalItems = await memberModel.countDocuments() // get the total counts od members
        const getMembers = await memberModel.find({}, { name: 1, email: 1, position: 1, department: 1, experience: 1, isLoginAccess: 1 }).skip(offset)
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
        const getMember = await memberModel.findOne({ _id: memberId }, { name: 1, email: 1, department: 1, position: 1, experience: 1 })
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
        const { name, email, department, position, experience, isLoginAccess } = memberBody
        const findMember = await memberModel.findOne({ _id: memberId })
        if (findMember === null || findMember === undefined) {
            return {
                message: messages.itemListNotFound.replace("Item list", messageConstant.MEMBER),
                status: statusCodeConstant.NOT_FOUND
            }
        }
        await memberModel.findOneAndUpdate({ _id: memberId }, { $set: { name, email, department, position, experience, isLoginAccess } })
        return {
            message: messages.itemUpdatedSuccess.replace("Item", messageConstant.MEMBER),
            status: statusCodeConstant.OK
        }
    }
    catch (error) {
        throw errorHandler(error);
    }
}
/**
 * This Service use for to delete the member
 * @param {*} memberId 
 * @returns 
 */
const deleteMember = async (memberId) => {
    try {
        console.log("calling delete", memberId)
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

export default {
    verifyMemberLogin,
    addTeamMembers,
    getMembers,
    getMemberById,
    updateMember,
    deleteMember
}
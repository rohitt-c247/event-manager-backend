
import { google } from "googleapis";
import { FRONT_APP_URL, FRONT_END_GOOGLE_CALLBACK, GOOGLE_CLIENT_ID, GOOGLE_SECRET_ID } from "../config/envConfig.js";
const verifyMemberLogin = async (auth) => {
    try {
        // Getting code from the frontend
        const { code } = auth;
        console.log("code", code)
        // return 0
        // Checking the code received or not from the frontend.
        // if (!code) {
        //     const userData = {
        //         message: message.signUpCode.replace(":Item", messageConstant.USER),
        //         user: null,
        //         token: null,
        //     }
        //     return userData;
        // }
        /* 
            ** Creating the google auth with Project credentials, 
            ** Basically Project credentials are those credentials that will create from the APIs & Services
        */
        const oauth2Client = new google.auth.OAuth2(
            GOOGLE_CLIENT_ID,
            GOOGLE_SECRET_ID,
            `${FRONT_APP_URL}${FRONT_END_GOOGLE_CALLBACK}`    //'postmessage' // we can pass here redirect_url as well, but as we are doing it by the google login popup so its not required
        );
        console.log("oauth2Client_________", oauth2Client)
        /**
            ** Getting tokens from the code that was submitted from client side
            ** In the token object we will get multiple things like access_token, refresh_token, scope, id_token & expiry_date
         */
        const { tokens } = await oauth2Client.getToken(code)
        console.log("tokens", tokens)

        const idToken = tokens.id_token;
        const userInfo = await client.verifyIdToken({
            idToken, // Getting IdToken from the frontend ( Client side )
            audience: GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = userInfo.getPayload();
        console.log(payload, "payload+++++++++")
        if (payload.sub && payload.email) {
            const { email, given_name: firstName, family_name: lastName, picture: profileImage, name: fullName, email_verified, sub } = payload

            /**
             * Get user from database for checking its already registered?
             * If registered then then do not insert is again and return it to else condition and only create JWT token
             */
            // const getUser = await userModel.findOne(
            //     { email },
            //     {
            //         email: 1,
            //         firstName: 1,
            //         lastName: 1,
            //         fullName: 1,
            //         email_verified: 1,
            //         profileImage: 1,
            //         status: 1,
            //         sub: 1,
            //         googleToken: 1
            //     })

        }
    } catch (error) {
        console.log("Error while login++++++++++", error)
        // logger.error(error);
        // Save the error in the database
        // await errorModel.create({ errors: [{ message: error }] });
        // throw errorHandler(error)
    }
}

const addTeamMembers = async (userId, email) => {
    try {
        console.log("calling api")
    }
    catch (error) {
        log("error=========", error);
        // throw errorHandler(error);
    }
};

export default {
    verifyMemberLogin,
    addTeamMembers
}
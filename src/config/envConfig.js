import dotenv from "dotenv"
dotenv.config();

/**
 * Getting all the environment variables from the process from ENV and exporting them into 
 * Single String format
 */
const APP_NAME = process.env.APP_NAME
const DATABASE_URI = process.env.DATABASE_URI || '';
const PORT = process.env.PORT || '';
const FRONT_END_GOOGLE_CALLBACK = process.env.FRONT_END_GOOGLE_CALLBACK;
const FRONT_APP_LOCAL_URL = process.env.FRONT_APP_LOCAL_URL;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_SECRET_ID = process.env.GOOGLE_SECRET_ID || '';
const ORGANIZATION_DOMAIN = process.env.ORGANIZATION_DOMAIN;


let FRONT_APP_URL
if (PORT === '8000') {
    FRONT_APP_URL = process.env.FRONT_APP_LOCAL_URL
}
export {
    APP_NAME,
    DATABASE_URI,
    PORT,
    FRONT_APP_URL,
    FRONT_END_GOOGLE_CALLBACK,
    GOOGLE_CLIENT_ID,
    GOOGLE_SECRET_ID,
    FRONT_APP_LOCAL_URL,
    ORGANIZATION_DOMAIN
}

import mongoose from "mongoose";
import { DATABASE_URI } from './envConfig.js'
import { messages } from "../common/messages.js";

/*
* Database configuration function for connecting mongodb
* 
*/
const databaseConnection = async () => {
    return mongoose.connect(DATABASE_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log(messages.connectionCreated);
    }).catch((err) => {
        console.log(messages.connectionFailed, err.message);
    })
}

export default databaseConnection;
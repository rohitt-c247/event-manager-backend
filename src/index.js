import express from 'express';
import cors from 'cors';
import { PORT } from './config/envConfig.js'
import databaseConnection from './config/dbConfig.js';
import { messages } from './common/messages.js';
import router from './routes/index.js';

const app = express();

// resolution of cross origin issues
const corsOption = {
    origin: process.env.FRONT_APP_LOCAL_URL.split(","),
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    // exposedHeaders: ["x-auth-token", "authorization"],
};
app.use(cors(corsOption));

/**
 * A database connection function 
 * @param { NO params required } connection
 */
databaseConnection()

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * Using the app to use our all routes
 */
app.use('/', router)

/**
 * Creating the server using express on the Specific code 
 * that is defined in the .env file
 */
app.listen(PORT, () => {
    return console.info(`${messages.serverRunningString} ${PORT}`);
});

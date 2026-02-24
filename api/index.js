import express from 'express';
import cors from 'cors';
import { PORT } from './config/envConfig.js'
import databaseConnection from './config/dbConfig.js';
import { messages } from './common/messages.js';
import router from './routes/index.js';
import { statusCodeConstant } from './common/constant.js';

const app = express();

// resolution of cross origin issues
const corsOption = {
    origin: "*",
    methods: "*",
    // credentials: true,
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

app.get('/', (req, res) => {
    res.end(`Hello! Go to item:`);
});

/**
 * Using the app to use our all routes
 */
app.use('/', router)

/**
 * Global Error-Handling Middleware
 * This catches all errors passed via next(error) and returns JSON response
 */
app.use((err, req, res, next) => {
    const status = err.status || statusCodeConstant.INTERNAL_SERVER_ERROR;
    const message = err.message || messages.somethingWentWrong;
    
    // Log error in development
    if (process.env.NODE_ENV !== 'production') {
        console.error('Global Error Handler:', err);
    }

    // Return JSON response instead of HTML
    res.status(status).json({
        success: false,
        message: message,
    });
});

/**
 * Creating the server using express on the Specific code 
 * that is defined in the .env file
 */
app.listen(PORT, () => {
    return console.log(`${messages.serverRunningString} ${PORT}`);
});

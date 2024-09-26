import express from "express";
import serverless from "serverless-http";
import cors from 'cors';
import databaseConnection from '../../src/config/dbConfig.js';
import router from '../../src/routes/index.js';
const api = express();

// resolution of cross origin issues
const corsOption = {
    origin: "http://localhost:3000", // Allows all origins
    methods: "*",
    credentials: true,
    // exposedHeaders: ["x-auth-token", "authorization"],
};
api.use(cors(corsOption));

/**
 * A database connection function 
 * @param { NO params required } connection
 */
databaseConnection();

api.use(express.urlencoded({ extended: true }));
api.use(express.json());

api.use("/api/", router);

api.get('/api', (req, res) => {
    res.send('Hello ✋ Event Mnagement')
})

export const handler = serverless(api);

import { NODE_ENV } from "../config/envConfig.js";
import { messages } from "../common/messages.js";
import { statusCodeConstant } from "../common/constant.js";
/**
 * APi response handler
 * @param {*} res 
 * @param {*} message 
 * @param {*} status 
 * @param {*} data 
 * @returns 
 */
export const responseHandler = async (
  res,
  message,
  status = statusCodeConstant.OK,
  data = null,
) => {
  const response = {
    success: true,
    message,
    data,
  };

  // Only add the data field if it's not null
  if (data !== null) {
    response.data = data;
  }

  return res.status(status).json(response);
};
/**
 * catch error handler
 * @param {*} error 
 * @param {*} next 
 */
export const catchHandler = (error, next) => {
  // Create a proper error object with message and status
  const errorObj = new Error(
    error instanceof Error ? error.message : messages.somethingWentWrong,
  );
  errorObj.status = error.status || statusCodeConstant.INTERNAL_SERVER_ERROR;
  errorObj.originalMessage = error.message || "";

  // Optional: Log the error for debugging in development.
  if (NODE_ENV !== "production") {
    console.error("Error caught in catchHandler:", error);
  }

  // Pass only the error object to the next middleware
  next(errorObj);
};

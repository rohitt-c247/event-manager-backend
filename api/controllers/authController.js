import { catchHandler, responseHandler } from "../helpers/error.js";
import authService from "../services/authService.js";
/**
 * Controller for register user
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, countryCode, password } =
      req.body;
    const { status, success, message, data } = await authService.registerUser(
      firstName,
      lastName,
      email,
      phoneNumber,
      countryCode,
      password,
    );
    if (success) {
      responseHandler(res, message, status, data);
    } else {
      // Create proper error object and pass to next()
      const error = new Error(message);
      error.status = status;
      error.data = data;
      next(error);
    }
  } catch (error) {
    catchHandler(error, next);
  }
};

/**
 * Controller for login user
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { status, success, message, data } = await authService.loginUser(
      email,
      password,
    );
    if (success) {
      responseHandler(res, message, status, data);
    } else {
      const error = new Error(message);
      error.status = status;
      error.data = data;
      next(error);
    }
  } catch (error) {
    catchHandler(error, next);
  }
};

export default {
  registerUser,
  loginUser,
};

import { status, statusCodeConstant } from "../common/constant.js";
import { messages } from "../common/index.js";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../helpers/auth.js";
import { User } from "../models/userModel.js";
/**
 * Service for to register user
 * @param {*} firstName
 * @param {*} lastName
 * @param {*} email
 * @param {*} phoneNumber
 * @param {*} countryCode
 * @param {*} password
 * @returns
 */
const registerUser = async (
  firstName,
  lastName,
  email,
  phoneNumber,
  countryCode,
  password,
) => {
  const formattedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return {
      status: statusCodeConstant.NOT_FOUND,
      success: false,
      message: messages.alreadyExist,
      data: null,
    };
  }
  const hashedPassword = await hashPassword(password);

  const newUser = new User({
    firstName,
    lastName,
    email: formattedEmail,
    password: hashedPassword,
    phoneNumber,
    countryCode,
    status: status.ACTIVE, // set default active now
  });
  const createdUser = await newUser.save();
  return {
    status: statusCodeConstant.OK,
    success: true,
    message: messages.userRegisterSuccess,
    data: createdUser,
  };
};
/**
 * Service for to login the user
 * @param {*} email
 * @param {*} password
 * @returns
 */
const loginUser = async (email, password) => {
  const formattedEmail = email.toLowerCase();
  const user = await User.findOne({ email: formattedEmail });

  if (!user) {
    return {
      status: statusCodeConstant.NOT_FOUND,
      success: false,
      message: messages.userNotFound,
      data: null,
    };
  }

  if (!user.password) {
    return {
      status: statusCodeConstant.UNAUTHORIZE,
      success: false,
      message: messages.invalidCredentials,
      data: null,
    };
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return {
      status: statusCodeConstant.UNAUTHORIZE,
      success: false,
      message: messages.invalidCredentials,
      data: null,
    };
  }

  const token = generateToken(user._id);

  // Update last login time
  user.lastLogin = new Date();
  await user.save();

  const userData = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    status: user.status,
  };

  return {
    status: statusCodeConstant.OK,
    success: true,
    message: messages.loginSuccess,
    data: {
      user: userData,
      token,
    },
  };
};

export default {
  registerUser,
  loginUser,
};

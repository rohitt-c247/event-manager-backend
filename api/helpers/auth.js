import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/envConfig.js";

export const generateSetPasswordToken = async () => {
  // Generate a random token and its hashed version
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = generateHashedToken(token);

  // Calculate token expiration duration in milliseconds
  const expireDuration = await commonHandler.convertTime(
    Number(userVariables.SET_PASSWORD_EXPIRE),
    userVariables.SET_PASSWORD_TOKEN_UNIT,
    "millisecond",
  );

  // Set the expiration date based on current time and duration
  const expireDate = new Date(Date.now() + expireDuration);

  return { token, hashedToken, expireDate };
};
/**
 * hashed password
 * @param {*} password 
 * @returns 
 */
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};
/**
 * compare the password
 * @param {*} enteredPassword 
 * @param {*} hashedPassword 
 * @returns 
 */
export const comparePassword = async (enteredPassword, hashedPassword) => {
  return await bcrypt.compare(enteredPassword, hashedPassword);
};
/**
 * Generate token by user id
 * @param {*} userId 
 * @returns 
 */
export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

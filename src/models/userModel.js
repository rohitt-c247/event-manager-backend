import mongoose, { Schema } from "mongoose";
import { status } from "../common/constant.js";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    phoneNumber: {
      type: String,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    status: {
      type: Number,
      default: status.ACTIVE,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    googleId: String,
    facebookId: String,
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpire: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model("users", userSchema);

import Joi from "joi";

export const userCreateValidationSchema = Joi.object({
  firstName: Joi.string().trim().required("First name is required"),
  lastName: Joi.string().trim().allow("").default(""),
  email: Joi.string().trim().email().required(),
  phoneNumber: Joi.string().trim().allow("").default(""),
  countryCode: Joi.string().trim().allow("").default(""),
  role: Joi.number().valid(0, 1).default(0),
  status: Joi.string().valid("Active", "Inactive").default("Inactive"),
  password: Joi.string()
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}\-_=+|\\:;"'<>,./~`]).{8,}$/,
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      "string.empty": "Password is required",
    }),
});

export const userLoginValidationSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().required(),
});

import { validationResult } from "express-validator"

const handleValidationErrors = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsArray = errors.array();
        let errorMessages = {};
        errorsArray.forEach((error) => {
            if (!errorMessages[error.path])
                errorMessages[error.path] = error.msg;
        });

        return res
            .status(422)
            .json({ message: "Invalid request", errors: errorMessages });
    }

    next();
};

export default handleValidationErrors;
import { statusCodeConstant } from "./constant.js"
import { messages } from "./messages.js"

const errorHandler = (error) => {
    let customError = new Error()
    customError.message = messages.somethingWentWrong
    customError.status = statusCodeConstant.INTERNAL_SERVER_ERROR
    customError.originalMessage = error ? error.message : ''
    return customError
}


export { errorHandler }
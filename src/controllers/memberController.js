import { statusCodeConstant } from "../common/index.js"
import { memberService } from "../services/index.js";

const verifyMemberLogin = async (req, res) => {
    try {
        const data = await memberService.verifyMemberLogin(req.body);
        res.status(statusCodeConstant.OK).json(data)
    } catch (error) {
        console.log("Error while login--", error);
        // res.status(typeof error.status === booleanWithString.TYPE_NUMBER ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status, originalMessage: error.originalMessage })
    }
}

const addTeamMembers = async (req, res) => {
    try {
        const { body: { } } = req;
        console.log("req,,,,,,,", req.body)
        const data = await memberService.addTeamMembers(req)
        res.status(statusCodeConstant.OK).json(data)
    } catch (error) {
        console.log("calling error", error)
        // res.status(typeof error.status === booleanWithString.TYPE_NUMBER ? error.status : statusCodeConstant.INTERNAL_SERVER_ERROR).json({ error: error.message, status: error.status })
    }
}

export default {
    verifyMemberLogin,
    addTeamMembers
}
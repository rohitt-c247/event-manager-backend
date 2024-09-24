import { Schema, model } from "mongoose"

const groupMemberSchema = new Schema(
    {
        userId: { type: String, default: "" },
        memberId: { type: String, default: "" },
        groupId: { type: String, default: "" },
        eventId: { type: String, default: "" }
    },
    {
        timestamps: true,
    }
)

export default model("groupMember", groupMemberSchema)
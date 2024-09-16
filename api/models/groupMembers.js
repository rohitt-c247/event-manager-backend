import { Schema, model } from "mongoose"

const groupMemberSchema = new Schema(
    {
        userId: { type: String, default: null },
        memberId: { type: String, default: null },
        groupId: { type: String, default: null }
    },
    {
        timestamps: true,
    }
)

export default model("groupMember", groupMemberSchema)
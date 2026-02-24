import { Schema, model } from "mongoose"

const groupSchema = new Schema(
    {
        userId: { type: String },
        eventId: { type: String },
        name: { type: String, default: "" },
        status: { type: String, default: null }
    },
    {
        timestamps: true,
    }
)

export default model("group", groupSchema)
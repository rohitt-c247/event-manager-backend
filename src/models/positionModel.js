import { Schema, model } from "mongoose"

const positionSchema = new Schema(
    {
        name: { type: String, default: "" },
    },
    {
        timestamps: true,
    }
)

export default model("positions", positionSchema)
import { Schema, model } from "mongoose"

const memberSchema = new Schema(
    {
        name: { type: String, default: "" },
        email: { type: String, default: "" },
        position: { type: String, default: "" },
        department: { type: String, default: "" },
        experience: { type: String, default: null },
        isLoginAccess: { type: Boolean, default: false }
    },
    {
        timestamps: true,
    }
)
/**
* Creating index to the columns
* With these columns we will implement the search and find functions
 **/
memberSchema.index({ userId: 1 });
memberSchema.index({ status: 1 });
export default model("members", memberSchema)
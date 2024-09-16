import { Schema, model } from "mongoose"

const memberSchema = new Schema(
    {
        name: { type: String, default: "" },
        email: { type: String, default: "" },
        position: { type: String, default: "" },
        department: { type: String, default: "" },
        experience: { type: Number, default: null },
        isLoginAccess: { type: Boolean, default: false },
        picture: { type: String, default: null }
    },
    {
        timestamps: true,
    }
)
/**
* Creating index to the columns
* With these columns we will implement the search and find functions
 **/
memberSchema.index({ email: 1 });
memberSchema.index({ name: 1 });
export default model("members", memberSchema)
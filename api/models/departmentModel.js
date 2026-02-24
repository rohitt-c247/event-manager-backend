import { Schema, model } from "mongoose"

const departmentSchema = new Schema(
    {
        name: { type: String, default: "" },
        createdBy: { type: String, default: "" }
    },
    {
        timestamps: true,
    }
)
/**
* Creating index to the columns
* With these columns we will implement the search and find functions
 **/
departmentSchema.index({ name: 1 });
export default model("department", departmentSchema)
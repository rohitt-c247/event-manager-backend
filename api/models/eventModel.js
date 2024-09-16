import { Schema, model } from "mongoose"

const eventSchema = new Schema(
    {
        name: { type: String, default: "" },
        description: { type: String, default: "" },
        date: { type: Date, default: null },
        numberOfGroup: { type: Number, default: 0 },
    },
    {
        timestamps: true,
    }
)
/**
* Creating index to the columns
* With these columns we will implement the search and find functions
 **/
eventSchema.index({ name: 1 });
eventSchema.index({ date: 1 });
export default model("event", eventSchema)
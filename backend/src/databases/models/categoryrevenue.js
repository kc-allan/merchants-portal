import mongoose from "mongoose"

const { Schema } = mongoose


const categoryRevenue = new Schema({
    category: String,
    totalRevenue: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
})

const revenue = mongoose.model("revenue", categoryRevenue)

export default revenue
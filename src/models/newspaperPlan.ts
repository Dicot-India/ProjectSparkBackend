import mongoose from "mongoose";

const newspaperSchema = new mongoose.Schema({
  newspaperID: {
    type: String,
    required: true,
  },
  newspaper: {
    type: String,
    required: true,
  },
  monthlyPrice: {
    type: Number,
    required: true,
  },
  yearlyPrice: {
    type: Number,
    required: true,
  },
});

const newspaperPlans = mongoose.model("newspaperplans", newspaperSchema);
export default newspaperPlans;

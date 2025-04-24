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
  price: {
    type: Number,
    required: true,
  },
});

const newspaperPlans = mongoose.model("newspaperplans", newspaperSchema);
export default newspaperPlans;

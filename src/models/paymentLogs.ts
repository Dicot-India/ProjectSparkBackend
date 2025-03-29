import mongoose from "mongoose";

const paymentLogSchema = new mongoose.Schema({
  paymentID: {
    type: String,
    required: true,
  },

  phone: {
    type: String,
    required: true,
  },

  planID: {
    type: String,
    required: true,
  },

  paymentMethod: {
    type: String,
    required: true,
  },

  paymentDate: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  orderID: {
    type: String,
    require: true,
  },

  expired: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const paymentLogs = mongoose.model("paymentlogs", paymentLogSchema);

export default paymentLogs;

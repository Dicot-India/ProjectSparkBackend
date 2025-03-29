import mongoose from "mongoose";

const emailOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

const EmailOTP = mongoose.model("emailVerification", emailOTPSchema);
export default EmailOTP;

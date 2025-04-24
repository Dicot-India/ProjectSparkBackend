import mongoose from "mongoose";

const phoneVerifiedOTPSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
  },
  OTP: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,
  },
});

const PhoneOTP = mongoose.model("phoneVerification", phoneVerifiedOTPSchema);
export default PhoneOTP;

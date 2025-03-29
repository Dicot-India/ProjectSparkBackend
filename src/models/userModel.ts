import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },

  email: {
    type: String,
  },
  password : {
    type : String,
    required : true
},

  gstNumber: {
    type: String,
    required: true,
    unique: true,
  },

  companyName: {
    type: String,
    required: true,
  },

  unitNumber: {
    type: String,
    required: true,
  },

  society: {
    type: String,
    required: true,
  },

  landmark: {
    type: String,
    required: true,
  },

  street: {
    type: String,
    required: true,
  },

  city: {
    type: String,
    required: true,
  },

  state: {
    type: String,
    required: true,
  },

  emailVerified: {
    type: Boolean,
    default: false,
  },
  
  phoneVerified: {
    type: Boolean,
    default: false,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);
export default User;

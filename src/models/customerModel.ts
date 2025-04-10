import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    ref: "User",
  },

  // customerID: {
  //     type: String,
  //     required: true,
  // },

  customerName: {
    type: String,
    required: true,
  },

  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },

  companyName: {
    type: String,
  },

  email: {
    type: String,
    // unique: true,
  },

  gstNumber: {
    type: String,
    // unique: true,
  },

  society: {
    type: String,
    required: false,
  },

  landmark: {
    type: String,
    required: false,
  },

  street: {
    type: String,
    required: false,
  },

  city: {
    type: String,
    required: false,
  },

  state: {
    type: String,
    required: false,
  },

  verified: {
    type: Boolean,
    default: false,
  },

  isPause: {
    type: Boolean,
    default: false,
  },

  unitNumber: {
    type: String,
    required: true,
  },

  pauseDate: {
    type: Date,
  },

  newsPapers: [
    {
      newspaperID: {
        type: String,
        required: false,
        sparse: true,
      },

      newspaperName: {
        type: String,
      },

      price: {
        type: Number,
      },

      paymentDate: {
        type: Date,
      },

      dueDate: {
        type: Date,
      }
    },
  ],
});

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;

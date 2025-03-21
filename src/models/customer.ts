
import mongoose from "mongoose";


const customerSchema = new mongoose.Schema({

    id: {
        type: String,
        required: true,
        ref: "User"
    },

    customerID: {
        type: String,
        required: true,
    },

    customerName: {
        type: String,
        required: true,
        unique: true
    },

    phoneNumber: {
        type: String,
        required: true,
        unique: true
    },

    companyName: {
        type: String,
    },

    email: {
        type: String,
        unique: true
    },

    gstNumber: {
        type: String,
        unique: true
    },

    unitType: {
        type: String,
        required: false,
    },

    bunglowsNo:
    {
        type: String,
        required: false,
    },

    apartmentName:
    {
        type: String,
        required: false
    },

    blockNumber:
    {
        type: String,
        required: false
    },

    society:
    {
        type: String,
        required: false
    },

    landmark:
    {
        type: String,
        required: false,
    },

    street:
    {
        type: String,
        required: false
    },


    city:
    {
        type: String,
        required: false
    },

    state:
    {
        type: String,
        required: false
    },

    verified: {
        type: Boolean,
        default: false
    },

    newsPapers: [
        {
            newspaperID: {
                type: String,
                unique: true
            },

            newspaperName:{
                type: String,
                required: false
            },


            publisher: {
                type: String,
                unique: false
            },

            price: {
                type: Number
            }
        }
    ]



});

const Customer = mongoose.model("Customer",customerSchema);
export default Customer;

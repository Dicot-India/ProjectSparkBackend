
import mongoose from "mongoose";


const customerSchema = new mongoose.Schema({

    id: {
        type: String,
        required: true,
        ref: "User"
    },


    customerName: {
        type: String,
        required: true
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

    unitNumber: {
        type: String,
        required: true,
    },


    society:
    {
        type: String,
        required: true
    },

    landmark:
    {
        type: String,
        required: true,
    },

    street:
    {
        type: String,
        required: true
    },


    city:
    {
        type: String,
        required: true
    },

    state:
    {
        type: String,
        required: true
    },


    newsPapers: [
        {
            newspaperID: {
                type: String
            },

            newspaperName: {
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

const Customer = mongoose.model("Customer", customerSchema);
export default Customer;

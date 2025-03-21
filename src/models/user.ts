import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        unique: true
    },

    gstNumber: {
        type: String,
        required: true,
        unique: true
    },

    companyName: {
        type: String,
        required: true
    },

    unitType: {
        type: String,
        required: true,
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

    society:
    {
        type: String,
        required: false
    },

    blockNumber:
    {
        type: String,
        required: false
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

    verified: {
        type: Boolean,
        default: false
    }

});

const User = mongoose.model("User", UserSchema);
export default User;

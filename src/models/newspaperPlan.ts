import mongoose from "mongoose";


const newspaperSchema = new mongoose.Schema({
    newspaperID : {
        type : String,
        required : true
    },
    newspapaer : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    }
})
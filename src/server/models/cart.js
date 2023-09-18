const mongoose  = require('mongoose');

const cartSchema = new mongoose.Schema({
    productid:{
        type:String,
        required:true
    },
    buyerid:{
        type:String,
        required:true

    }
})
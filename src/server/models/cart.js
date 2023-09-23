const mongoose  = require('mongoose');

const cartSchema = new mongoose.Schema({
    productid:{
        type:String,
        required:true
    },
    buyerid:{
        type:String,
        required:true

    },
    quantity: {
        type: Number,
        required: true,
    },
    available: {
        type: Number,
        required: true
    },
    totalCost: {
        type:Number,
        required: true,
    },
    price: {
        type:Number,
        required: true,
    }

});

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart
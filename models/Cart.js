const mongoose = require('mongoose')


const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
       id: {
        type: String,
        require: true
       },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        total: {
            type: Number,
            requird: true
        }
        
    }
)  

module.exports = mongoose.model("Cart", cartSchema)
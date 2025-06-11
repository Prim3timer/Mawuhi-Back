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
        }
        
    }
)  

module.exports = mongoose.model("Cart", cartSchema)
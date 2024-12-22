const mongoose = require('mongoose')

const inventroySchema = new mongoose.Schema({
    name: {type: String, required: true},
    qty: {type: Number, required: true},
    // description: {type:String},
    date: {type: String, required: true}
})

// module.exports = mongoose.model("Inventory", inventroySchema)
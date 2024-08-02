const mongoose = require('mongoose')

const salesSchema = new mongoose.Schema({
        
    goods: {
         type: Array,
         required: true,
     },

     completed: {
         type: Boolean,
         default: false
 },
})

module.exports = mongoose.model('Sales', salesSchema)
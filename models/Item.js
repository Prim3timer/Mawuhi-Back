const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            requred: true
        },
        unitMeasure: {
            type: String,
            required: true
        },
        piecesUnit: {
            type: String
        }
    },
)

module.exports = mongoose.model('Item', itemSchema)
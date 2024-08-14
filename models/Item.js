const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const Schema = mongoose.Schema

const itemSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        unitMeasure: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            requred: true
        },
        piecesUnit: {
            type: String
        }
    }
)

module.exports = mongoose.model('Item', itemSchema)
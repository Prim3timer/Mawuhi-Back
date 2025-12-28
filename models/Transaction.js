const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const transactionSchema = new mongoose.Schema({
title: {
    type: String,
    default: 'Yo Biz'
},
    cashier: {
        type: String,
        // required: true
    },
    cashierID: {
        type: String,
        // required: true
    },
        
       goods: {
            type: Array,
            required: true,
        },

        completed: {
            type: Boolean,
            default: false
        },
        grandTotal: {
            type: Number,
            required: true
        },
        last4: {
            type: Number,
        },
        address: {
            type: Object,
        },
        date: {type: String,
          required: true
        },
        name: {
            type: String
        },
        email: {
            type: String
        }
    },
)

transactionSchema.plugin(AutoIncrement, {
    inc_field: 'ticket',
    ref_value: transactionSchema.goods,
    id: 'ticketNums',
    start_seq: 500
})

module.exports = mongoose.model('Transaction', transactionSchema)
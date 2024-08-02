const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const transactionSchema = new mongoose.Schema({
        
       goods: {
            type: Array,
            required: true,
        },

        completed: {
            type: Boolean,
            default: false
        },
        date: {type: Date,
          required: true
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
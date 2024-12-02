const mongoose = require('mongoose')

const Schema = mongoose.Schema

const resultSchema = new Schema({
    candidate: {type: String},
    q_no: {type: Array, required: true},
    questions: {type: Array, required: true},
    attempt: {type: Array, required: true},
    answer: {type: Array, required: true },
    date: {type: String, required: true} 
})

const Result = mongoose.model('Result', resultSchema)
module.exports = Result
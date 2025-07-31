const mongoose = require('mongoose')

const mySessionSchema  = new mongoose.Schema({
    title: {
        type: String
    }
})

module.exports = mongoose.model("MySession", mySessionSchema)
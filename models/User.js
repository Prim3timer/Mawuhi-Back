const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    roles: {
        Employee: {
            type: Number,
            default: 2001
        }, Editor: Number,
        Admin: Number
    },
    password: {
        type: String,
        require: true
    },
    refreshToken: String
})

module.exports = mongoose.model("User", userSchema)
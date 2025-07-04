const mongoose = require('mongoose')
const { Employee } = require('../config/roles_list')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true
    },
    roles: {
        Employee: {
            type: Number,
            default: 2001
        }, Manager: Number,
        Admin: Number
    },
    password: {
        type: String,
        require: true
    },
    active: {
        type: Boolean,
        default: true
    },
    cart: {
        type: Array
    },
    refreshToken: String
})

module.exports = mongoose.model("User", userSchema)
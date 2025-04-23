const User = require('../models/User')
const Transaction = require('../models/Transaction')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')


const getAllUsers = asyncHandler(async (req, res) => {
     const users = await User.find();
     for (let user of users){
        console.log(user.username, user.password)
     }
    if (!users.length) return res.status(204).json({ 'message': 'No users found' });
    res.json(users);
})

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body

    // Confirm data
    if (!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Check for duplicate username
    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()



    if (duplicate) {
        return res.status(409).json({ message: 'Duplicate username' })
    }

    // Hash password 
    const hashedPwd = await bcrypt.hash(password, 10) // salt rounds

    const userObject = { username, "password": hashedPwd, roles }

    // Create and store new user 
    const user = await User.create(userObject)

    if (user) { //created 
        res.status(201).json({ message: `New user ${username} created` })
    } else {
        res.status(400).json({ message: 'Invalid user data received' })
    }
})


// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.params

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    // Confirm note exists to delete 
    const results = await User.find({_id: id})

    if (!results) {
        return res.status(400).json({ message: 'Item not found' })
    }

    const result = await User.deleteOne({_id: id})

    const reply = `Item '${result.name}' with ID ${result._id} deleted`

    res.json(reply)
})


const updateUser = asyncHandler(async (req, res) => {
    const {roles, username, password, active} = req.body

    
    const id = req.params.id
    const foundUser  = await User.findById(id)
    if (foundUser){

        if (id){
            const currentItem = await User.findOneAndUpdate({
               _id: id}, 
                {
                    username: username ? username : foundUser.username,
              roles: roles ? roles : foundUser.roles,
              password: password ? password : foundUser.password,
              active: active ? active : foundUser.active
           })
    
           res.json(`'${currentItem.name}' updated`)
        }
    }



})



module.exports = {
    getAllUsers,
    createNewUser,
    deleteUser,
    updateUser
  
}


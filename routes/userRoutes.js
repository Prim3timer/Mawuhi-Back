const express = require('express')
const router = express.Router()

const usersController = require('../controllers/usersController')

router.route('/')
.get(usersController.getAllUsers)
.post(usersController.createNewUser) 

router.route('delete/:id')
    .delete(usersController.deleteUser) 

    router.route('/update/:id')
.patch(usersController.updateUser)

module.exports = router 
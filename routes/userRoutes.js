const express = require('express')
const router = express.Router()
const verifyJWT = require('../middleware/verifyJwT')
const usersController = require('../controllers/usersController')

router.use(verifyJWT)

router.route('/')
.get(usersController.getAllUsers)
.post(usersController.createNewUser) 

router.route('/delete/:id')
    .delete(usersController.deleteUser) 

    router.route('/update/:id')
.patch(usersController.updateUser)

module.exports = router 
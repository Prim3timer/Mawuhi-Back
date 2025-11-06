const express = require('express')
const router = express.Router()
const verifyJWT = require('../middleware/verifyJwT')
const usersController = require('../controllers/usersController')


// router.use(verifyJWT)   

router.route('/')   
.get( usersController.getAllUsers)
.post(usersController.createNewUser) 

router.route('/delete/:id')
    .delete(usersController.deleteUser) 

    router.route('/update/:id')
.patch(usersController.updateUser)

router.route('/sessions/:id')
.post(usersController.addToCart)

router.route('/sessions/delete')
.delete(usersController.deleteCartItem)

router.route('/clear/:id')
.delete(usersController.clearCart)

module.exports = router 
const express = require('express')
const Item = require('../models/Item')
const router = express.Router()

cartController = require('../controllers/cartController')


router.route('/create-checkout-session').post(cartController.makePayment)
router.route('/addcart').post(cartController.addToCart)
router.route('/').get(cartController.getCartItems)
router.route('/:id').delete(cartController.removeItem)
router.route('/clear/:id').delete(cartController.clearCart)


module.exports = router
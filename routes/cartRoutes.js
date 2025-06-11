const express = require('express')
const Item = require('../models/Item')
const router = express.Router()

cartController = require('../controllers/cartController')


router.route('/create-checkout-session').post(cartController.makePayment)
router.route('/addcart').post(cartController.addToCart)
router.route('/').get(cartController.getCartItems)


module.exports = router
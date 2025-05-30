const express = require('express')
const Item = require('../models/Item')
const router = express.Router()

cartController = require('../controllers/cartController')


router.route('/').post(cartController.makePayment)


module.exports = router
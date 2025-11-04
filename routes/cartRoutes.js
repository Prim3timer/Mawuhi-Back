const express = require('express')
const router = express.Router()

cartController = require('../controllers/cartController')


router.route('/create-checkout-session').post(cartController.makePayment)
router.route('/thanks/:sessionId').post (cartController.thanksAlert)
router.route('/thanks/old-session/:sessionId').get(cartController.getSessionId)

module.exports = router
const express = require('express')
const router = express.Router()
sessionsController = require('../controllers/sessionsController')

router.route('/create-checkout-session').post(sessionsController.makePayment)
router.route('/#/thanks/:sessionId').post(sessionsController.thanksAlert)
router.route('/thanks/old-session/:sessionId').get(sessionsController.getSessionId)

module.exports = router